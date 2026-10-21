import { getModel } from "../configs/llmModels.js";
import generatePDF from "../utils/generatePDF.js";
import { getDataFromS3 } from "../utils/getDataFromS3.js";
import { uploadOnS3 } from "../utils/uploadOnS3.js";
import deductCredits from "../utils/deductCredits.js";

const repairIncompleteJSON = (jsonString) => {
  let str = (jsonString || "").trim();

  // Strip Markdown code fences if any
  str = str
    .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/, "")
    .trim();
  const firstBrace = str.indexOf("{");
  if (firstBrace === -1) return null;
  str = str.slice(firstBrace);

  // Direct parse attempt
  try {
    return JSON.parse(str);
  } catch (e) {}

  // Inspect strings and brackets state
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (char === "\\" && !isEscaped) {
        isEscaped = true;
      } else if (char === '"' && !isEscaped) {
        inString = false;
      } else {
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
    }
  }

  let candidate = str;
  if (inString) {
    candidate += '"';
  }

  // Remove trailing commas, dangling colons, or cut-off array elements
  candidate = candidate
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/,\s*$/, "")
    .replace(/:\s*$/, ': ""');

  // Recalculate remaining open brackets
  const remainingStack = [];
  let inStr2 = false;
  let isEsc2 = false;
  for (let i = 0; i < candidate.length; i++) {
    const c = candidate[i];
    if (inStr2) {
      if (c === "\\" && !isEsc2) isEsc2 = true;
      else if (c === '"' && !isEsc2) inStr2 = false;
      else isEsc2 = false;
    } else {
      if (c === '"') inStr2 = true;
      else if (c === "{" || c === "[") remainingStack.push(c);
      else if (c === "}" && remainingStack[remainingStack.length - 1] === "{")
        remainingStack.pop();
      else if (c === "]" && remainingStack[remainingStack.length - 1] === "[")
        remainingStack.pop();
    }
  }

  candidate = candidate.trim().replace(/,\s*$/, "");

  // Close all remaining open brackets in reverse order
  while (remainingStack.length > 0) {
    const open = remainingStack.pop();
    candidate += open === "{" ? "}" : "]";
  }

  try {
    return JSON.parse(candidate);
  } catch (err) {
    // If still failing, trim back to the last complete object in sections
    const lastObj = str.lastIndexOf("}");
    if (lastObj > firstBrace) {
      let cutCandidate = str.slice(0, lastObj + 1).replace(/,\s*$/, "");
      const stack3 = [];
      let inS3 = false;
      for (let i = 0; i < cutCandidate.length; i++) {
        const c = cutCandidate[i];
        if (inS3) {
          if (c === '"' && cutCandidate[i - 1] !== "\\") inS3 = false;
        } else {
          if (c === '"') inS3 = true;
          else if (c === "{" || c === "[") stack3.push(c);
          else if (c === "}" && stack3[stack3.length - 1] === "{") stack3.pop();
          else if (c === "]" && stack3[stack3.length - 1] === "[") stack3.pop();
        }
      }
      while (stack3.length > 0) {
        const open = stack3.pop();
        cutCandidate += open === "{" ? "}" : "]";
      }
      try {
        return JSON.parse(cutCandidate);
      } catch (e3) {}
    }
  }

  return null;
};

const parseDocumentJSON = (rawText, defaultTitle = "Executive Document") => {
  if (!rawText) throw new Error("Empty response received from language model.");

  let parsed = null;

  // 1. Direct JSON parse
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // 2. Strip Markdown code fences
    const stripped = rawText
      .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
      .replace(/\s*```[\s\S]*$/, "")
      .trim();

    try {
      parsed = JSON.parse(stripped);
    } catch {
      // 3. Extract JSON between outer braces
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = rawText.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(potentialJson);
        } catch {
          // 4. Clean trailing commas
          try {
            const cleaned = potentialJson.replace(/,\s*([}\]])/g, "$1");
            parsed = JSON.parse(cleaned);
          } catch {
            // 5. Intelligent state-machine repair for truncated or cut-off JSON
            parsed = repairIncompleteJSON(rawText);
          }
        }
      } else {
        parsed = repairIncompleteJSON(rawText);
      }
    }
  }

  // Final check with repair if parsed is still null
  if (!parsed) {
    parsed = repairIncompleteJSON(rawText);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(
      "Failed to parse valid document JSON structure from AI output.",
    );
  }

  // Handle both { document: { ... } } and direct { title: ... } schemas
  const doc = parsed.document || parsed.data?.document || parsed;

  if (!doc.title || typeof doc.title !== "string" || !doc.title.trim()) {
    doc.title = defaultTitle;
  }

  if (!Array.isArray(doc.sections)) {
    doc.sections = [];
  }

  return doc;
};

export const pdfAgent = async (state) => {
  try {
    console.log("PDF agent responding to prompt:", state.prompt);
    const pdfLLM = await getModel("pdf");

    const prompt = `
You are a professional document content generator.
Your task is to generate well-structured, accurate, and
PDF-ready content based on the user's request.

USER REQUEST:
${state.prompt}

INSTRUCTIONS:
1. Understand the user's request and identify the appropriate
   document type, such as a report, guide, tutorial, proposal,
   summary, notes, or technical documentation.

2. Generate complete, meaningful, and well-organized content
   suitable for conversion into a professional PDF.

3. Return ONLY valid JSON.
   Do not include Markdown code fences, introductory text,
   explanations outside JSON, or comments.

4. Follow the exact JSON structure defined below.

5. Use clear headings, logical sections, and subsections.
   Arrange content in a natural reading order.

6. Use paragraphs for explanations and bulletPoints for lists.
   Do not put entire sections into one large paragraph.

7. Include examples, code snippets, tables, definitions,
   steps, or key takeaways whenever relevant to the request.

8. For programming-related content:
   - Put source code in codeBlocks.
   - Specify the programming language.
   - Include a meaningful title and explanation for each example.
   - Preserve code formatting and indentation.
   - Do not put code inside Markdown fences within JSON strings.

9. For tables:
   - Provide column headers and rows separately.
   - Ensure every row matches the number of columns.

10. For procedural content:
    - Use numbered steps in the steps array.
    - Explain each step clearly.

11. Do not invent facts, references, statistics, or citations.
    If information is uncertain, explicitly mention the uncertainty.

12. Use optional content types only when relevant.
    Empty arrays should be returned when no content is needed.

13. Keep the content relevant to the user's request.
    Avoid unnecessary repetition and filler.

14. Escape special characters correctly so the response
    is parseable using JSON.parse().

15. Focus on clarity and high-yield content. Create 3 to 5 key sections to ensure a complete, publication-ready, and untruncated document.

REQUIRED JSON SCHEMA:
{
  "document": {
    "title": "Document title",
    "subtitle": "Optional subtitle",
    "documentType": "report | guide | tutorial | notes | proposal | summary | documentation | other",
    "language": "English",
    "metadata": {
      "author": "AgentFlow AI",
      "createdAt": "",
      "version": "1.0"
    },
    "introduction": {
      "heading": "Introduction",
      "paragraphs": [],
      "bulletPoints": []
    },
    "tableOfContents": [
      {
        "id": "section-1",
        "title": "Section title",
        "subsections": [
          {
            "id": "section-1-1",
            "title": "Subsection title"
          }
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "heading": "Section heading",
        "description": "",
        "content": [
          {
            "type": "paragraph",
            "text": ""
          },
          {
            "type": "bulletList",
            "title": "",
            "items": []
          },
          {
            "type": "numberedList",
            "title": "",
            "items": []
          },
          {
            "type": "subheading",
            "text": ""
          },
          {
            "type": "table",
            "title": "",
            "columns": [],
            "rows": []
          },
          {
            "type": "code",
            "title": "",
            "language": "",
            "code": "",
            "explanation": ""
          },
          {
            "type": "quote",
            "text": "",
            "attribution": ""
          },
          {
            "type": "callout",
            "title": "",
            "text": "",
            "severity": "info"
          },
          {
            "type": "steps",
            "title": "",
            "items": [
              {
                "step": 1,
                "title": "",
                "description": ""
              }
            ]
          }
        ]
      }
    ],
    "conclusion": {
      "heading": "Conclusion",
      "paragraphs": [],
      "bulletPoints": []
    },
    "keyTakeaways": [],
    "references": [
      {
        "title": "",
        "url": "",
        "accessedAt": ""
      }
    ]
  }
}

IMPORTANT:
- The schema above describes the structure, not content to copy.
- Populate the fields with content relevant to the user request.
- The tableOfContents must match the actual sections and subsections.
- Every section and content item must have stable IDs where appropriate.
- Use only the content types needed by the request.
- Do not create placeholder sections or empty paragraphs.
- Return a single valid JSON object and nothing else.
`;

    const response = await pdfLLM.invoke(prompt);
    const rawContent = response.content;
    const defaultTitle = state.prompt
      ? state.prompt.slice(0, 50).trim()
      : "Executive Document";
    const docData = parseDocumentJSON(rawContent, defaultTitle);

    const pdfBuffer = await generatePDF(docData);

    const filename = `pdf-${Date.now()}.pdf`;
    let pdfUrl = null;
    let isS3 = false;

    try {
      await uploadOnS3(filename, pdfBuffer, "application/pdf");
      pdfUrl = await getDataFromS3(filename, 3000);
      isS3 = true;
    } catch (s3Error) {
      console.warn(
        "S3 upload failed, falling back to base64 data URI:",
        s3Error.message,
      );
      pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    }

    // Build rich, structured markdown output
    const title = docData.title || "Executive Document";
    const subtitle = docData.subtitle ? `*${docData.subtitle}*\n\n` : "";
    const docType = (docData.documentType || "DOCUMENT").toUpperCase();
    const author = docData.metadata?.author || "AgentFlow AI Intelligence";

    const introText = docData.introduction?.paragraphs?.[0]
      ? `> ${docData.introduction.paragraphs[0]}\n\n`
      : "";

    const sectionList = (docData.sections || [])
      .slice(0, 6)
      .map((sec, idx) => {
        const heading = sec.heading || `Section ${idx + 1}`;
        const summary =
          sec.description ||
          (sec.content?.[0]?.text
            ? sec.content[0].text.slice(0, 80) + "..."
            : "Included");
        return `- **${heading}**: ${summary}`;
      })
      .join("\n");

    const takeawaysText =
      Array.isArray(docData.keyTakeaways) && docData.keyTakeaways.length > 0
        ? `\n\n### 💡 Key Takeaways\n${docData.keyTakeaways
            .slice(0, 4)
            .map((k) => `- ${typeof k === "string" ? k : k.text || ""}`)
            .join("\n")}`
        : "";

    const formattedResponse = `
# 📄 ${title}
${subtitle}**Document Type:** \`${docType}\` • **Author:** ${author}

${introText}### 📑 Document Overview
${sectionList || "- Content generated successfully"}${takeawaysText}

---
[📄 **Download & View PDF Document: ${title}**](${pdfUrl})
${isS3 ? "\n*Secure S3 download link generated by AgentFlow AI.*" : ""}
`.trim();

    await deductCredits(state.userId, "pdf");

    return {
      ...state,
      aiResponse: formattedResponse,
    };
  } catch (error) {
    console.error("PDF agent error:", error);
    return {
      ...state,
      aiResponse: `⚠️ **PDF Generation Error**\n\nFailed to generate your PDF document: ${error.message || "An unexpected error occurred during processing."}\n\nPlease try again with a specific prompt.`,
    };
  }
};
