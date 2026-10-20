import { getModel } from "../configs/llmModels.js";
import { generatePPT } from "../utils/generatePPT.js";
import { getDataFromS3 } from "../utils/getDataFromS3.js";
import { uploadOnS3 } from "../utils/uploadOnS3.js";

const repairIncompleteJSON = (jsonString) => {
  let str = (jsonString || "").trim();

  // Strip Markdown code fences if any
  str = str.replace(/^[\s\S]*?```(?:json)?\s*/i, "").replace(/\s*```[\s\S]*$/, "").trim();
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
      else if (c === "}" && remainingStack[remainingStack.length - 1] === "{") remainingStack.pop();
      else if (c === "]" && remainingStack[remainingStack.length - 1] === "[") remainingStack.pop();
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

const parsePresentationJSON = (rawText, defaultTitle = "Executive Presentation") => {
  if (!rawText) throw new Error("Empty response received from language model.");

  let parsed = null;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    const stripped = rawText
      .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
      .replace(/\s*```[\s\S]*$/, "")
      .trim();

    try {
      parsed = JSON.parse(stripped);
    } catch {
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = rawText.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(potentialJson);
        } catch {
          try {
            const cleaned = potentialJson.replace(/,\s*([}\]])/g, "$1");
            parsed = JSON.parse(cleaned);
          } catch {
            parsed = repairIncompleteJSON(rawText);
          }
        }
      } else {
        parsed = repairIncompleteJSON(rawText);
      }
    }
  }

  if (!parsed) {
    parsed = repairIncompleteJSON(rawText);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Failed to parse valid presentation JSON structure from AI output.");
  }

  const pres = parsed.presentation || parsed.data?.presentation || parsed;

  if (!pres.title || typeof pres.title !== "string" || !pres.title.trim()) {
    pres.title = defaultTitle;
  }

  if (!Array.isArray(pres.slides)) {
    pres.slides = [];
  }

  return pres;
};

export const pptAgent = async (state) => {
  try {
    console.log("PPT agent called with prompt:", state.prompt);
    const pptLLM = await getModel("ppt");
    const prompt = `
You are a professional PowerPoint presentation content generator.
Your task is to generate well-structured, accurate, engaging, and
slide-ready presentation content based on the user's request.

USER REQUEST:
${state.prompt}

INSTRUCTIONS:
1. Understand the user's request and identify the appropriate
   presentation type, such as educational, business, technical,
   academic, project proposal, pitch deck, training, report,
   tutorial, or general presentation.

2. Generate complete, meaningful, and well-organized content
   suitable for conversion into a professional PowerPoint
   presentation.

3. Return ONLY valid JSON.
   Do not include Markdown code fences, introductory text,
   explanations outside JSON, or comments.

4. Follow the exact JSON structure defined below.

5. Create a logical presentation flow with an appropriate
   beginning, main content, and conclusion. Adapt the structure
   to the user's topic instead of forcing every presentation
   into the same template.

6. Give every slide a clear, descriptive, and engaging title.
   Each slide must communicate one primary idea or takeaway.

7. Keep slide content concise and presentation-friendly.
   Use short paragraphs and bullet points rather than lengthy
   blocks of text. Prefer 3 to 6 meaningful bullet points per
   slide when appropriate.

8. Generate content appropriate to the target audience,
   presentation purpose, requested language, tone, and
   complexity. If these details are not provided, make
   reasonable assumptions based on the user's request.

9. Include relevant examples, definitions, comparisons,
   statistics, case studies, processes, diagrams, tables,
   key insights, or recommendations whenever useful.

10. For every slide, provide:
    - A unique and stable slide ID.
    - A clear slide title.
    - The slide's objective.
    - The main takeaway or key message.
    - On-slide content.
    - Suggested visual elements.
    - Speaker notes when useful.
    - A transition to the next slide when appropriate.

11. Recommend meaningful visuals for each slide when relevant.
    Examples include charts, graphs, diagrams, flowcharts,
    timelines, comparison tables, infographics, illustrations,
    screenshots, and conceptual images.

12. For charts:
    - Specify the chart type and title.
    - Provide clear axis labels where applicable.
    - Provide data labels and series names where relevant.
    - Include the actual data points only when supported.
    - Never invent numerical data to populate a chart.
    - Explain the key insight the audience should notice.

13. For tables:
    - Provide column headers and rows separately.
    - Ensure every row matches the number of columns.
    - Keep table content concise enough for a presentation slide.

14. For programming or technical presentations:
    - Use codeBlocks for source code examples.
    - Specify the programming language.
    - Include a meaningful title and explanation.
    - Preserve code formatting and indentation.
    - Keep code examples short enough to fit a slide when possible.
    - Suggest a separate code-focused slide for longer examples.

15. For procedural or workflow presentations:
    - Use numbered steps in the steps array.
    - Provide a clear title and concise description for each step.
    - Suggest a flowchart or process diagram when appropriate.

16. For business, project, or strategy presentations:
    - Include the problem, context, proposed solution,
      supporting evidence, expected outcomes, and recommendations
      wherever relevant.
    - Include timelines, milestones, risks, or success metrics
      when requested or appropriate.
    - Clearly distinguish facts, assumptions, and projections.

17. For academic or research presentations:
    - Present the background, objectives, methodology,
      findings, discussion, and conclusion when applicable.
    - Include references for verifiable sources.
    - Do not fabricate research findings or citations.

18. Do not invent facts, references, statistics, quotations,
    sources, or claims.
    If information is uncertain, explicitly communicate
    the uncertainty.

19. Use optional content types only when relevant.
    Empty arrays should be returned when no content is needed.
    Do not add unnecessary visuals, charts, tables, or code.

20. Include speaker notes that expand on the slide content
    rather than merely repeating the bullet points.
    Speaker notes should help the presenter explain the topic
    naturally. Keep them concise and useful.

21. Recommend a consistent presentation design, including
    a suitable theme, color palette, typography, layout style,
    and visual approach. Design recommendations must support
    readability and the presentation's purpose.

22. Adapt the number of slides to the user's request.
    If no slide count is specified, create a reasonable,
    complete presentation without unnecessary repetition.
    Include a title slide and conclusion slide when appropriate.
    Add an agenda, references, or Q&A slide only when useful.

23. Ensure the presentation is self-contained and coherent.
    The slide content must be usable by a downstream
    PowerPoint-generation system without requiring it to
    guess the intended meaning.

24. Escape special characters correctly so the response
    can be parsed using JSON.parse().

25. Focus on clarity, high-value information, and visual
    storytelling. Avoid filler and repetitive content.
    Prefer a complete, concise presentation over excessive
    slide content that could become truncated.

REQUIRED JSON SCHEMA:
{
  "presentation": {
    "title": "Presentation title",
    "subtitle": "Optional subtitle",
    "presentationType": "educational | business | technical | academic | proposal | pitch-deck | training | report | tutorial | other",
    "language": "English",
    "metadata": {
      "author": "AgentFlow AI",
      "createdAt": "",
      "version": "1.0"
    },
    "overview": {
      "purpose": "",
      "targetAudience": "",
      "coreMessage": "",
      "estimatedDuration": "",
      "assumptions": []
    },
    "tableOfContents": [
      {
        "id": "slide-2",
        "title": "Slide title",
        "section": "Section name"
      }
    ],
    "slides": [
      {
        "id": "slide-1",
        "slideNumber": 1,
        "type": "title | agenda | content | comparison | process | chart | diagram | case-study | summary | conclusion | references | q-and-a | other",
        "title": "Slide title",
        "subtitle": "",
        "section": "Section name",
        "objective": "What this slide should achieve",
        "keyMessage": "The primary takeaway from this slide",
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
            "type": "table",
            "title": "",
            "columns": [],
            "rows": []
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
          },
          {
            "type": "code",
            "title": "",
            "language": "",
            "code": "",
            "explanation": ""
          },
          {
            "type": "callout",
            "title": "",
            "text": "",
            "severity": "info | success | warning | critical"
          },
          {
            "type": "quote",
            "text": "",
            "attribution": ""
          }
        ],
        "visuals": [
          {
            "type": "image | chart | diagram | flowchart | timeline | infographic | icon | screenshot | illustration | table | none",
            "title": "",
            "description": "",
            "purpose": "",
            "placement": "left | right | center | full-width | background",
            "imagePrompt": "",
            "altText": ""
          }
        ],
        "chartData": {
          "chartType": "bar | line | pie | doughnut | area | scatter | none",
          "title": "",
          "xAxisLabel": "",
          "yAxisLabel": "",
          "categories": [],
          "series": [
            {
              "name": "",
              "data": []
            }
          ],
          "dataSource": "",
          "insight": ""
        },
        "speakerNotes": "",
        "transition": "",
        "references": []
      }
    ],
    "designGuidelines": {
      "theme": "",
      "colorPalette": [],
      "typography": {
        "headingFontStyle": "",
        "bodyFontStyle": ""
      },
      "layoutStyle": "",
      "visualStyle": "",
      "consistencyRules": []
    },
    "conclusion": {
      "heading": "Conclusion",
      "summary": "",
      "keyTakeaways": [],
      "callToAction": ""
    },
    "references": [
      {
        "id": "ref-1",
        "title": "",
        "url": "",
        "publisher": "",
        "publishedAt": "",
        "accessedAt": "",
        "usedInSlides": []
      }
    ]
  }
}

IMPORTANT:
- The schema above describes the structure, not content to copy.
- Populate every applicable field with content relevant to the user's request.
- Return a single valid JSON object and nothing else.
- The tableOfContents must match the actual slides.
- Every slide must have a unique, stable ID.
- Slide numbers must be sequential, starting from 1.
- Use only the content types needed by the request.
- For unused content types, use empty arrays or empty strings as appropriate to the schema.
- Do not create placeholder slides or meaningless content.
- The title slide should introduce the presentation clearly.
- The final content slide should provide a meaningful conclusion or actionable takeaway when appropriate.
- The number of slides must match the requested count when given.
- The chartData object must contain real, relevant data when a chart is used; otherwise use empty arrays and "none".
- Visual recommendations must describe what should be shown.
- References must correspond to actual sources used.
- The conclusion.keyTakeaways should summarize the most important points from the presentation.
- Keep slide text concise and put extended explanations in speakerNotes.
- Do not create empty paragraphs or unnecessary content items.
- Ensure the final JSON is syntactically valid and parseable using JSON.parse().
`;

    const response = await pptLLM.invoke(prompt);
    const rawContent = response.content;
    const defaultTitle = state.prompt ? state.prompt.slice(0, 50).trim() : "Executive Presentation";
    const presData = parsePresentationJSON(rawContent, defaultTitle);

    const pptBuffer = await generatePPT(presData);

    const filename = `ppt-${Date.now()}.pptx`;
    let pptUrl = null;
    let isS3 = false;

    try {
      await uploadOnS3(
        filename,
        pptBuffer,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
      pptUrl = await getDataFromS3(filename, 3000);
      isS3 = true;
    } catch (s3Error) {
      console.warn("S3 upload failed, falling back to base64 data URI:", s3Error.message);
      pptUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptBuffer.toString("base64")}`;
    }

    // Build rich, structured markdown output
    const title = presData.title || "Executive Presentation";
    const subtitle = presData.subtitle ? `*${presData.subtitle}*\n\n` : "";
    const presType = (presData.presentationType || "PRESENTATION").toUpperCase();
    const author = presData.metadata?.author || "AgentFlow AI";
    const slideCount = (presData.slides || []).length;

    const overviewText = presData.overview?.coreMessage || presData.overview?.purpose
      ? `> 🎯 **Core Message:** ${presData.overview.coreMessage || presData.overview.purpose}\n\n`
      : "";

    const slideList = (presData.slides || [])
      .slice(0, 8)
      .map((slide, idx) => {
        const slideTitle = slide.title || `Slide ${idx + 1}`;
        const keyMsg =
          slide.keyMessage ||
          slide.objective ||
          (slide.content?.[0]?.text
            ? slide.content[0].text.slice(0, 70) + "..."
            : "Slide content prepared");
        return `- **Slide ${slide.slideNumber || idx + 1}: ${slideTitle}** — ${keyMsg}`;
      })
      .join("\n");

    const takeawaysText =
      presData.conclusion &&
      Array.isArray(presData.conclusion.keyTakeaways) &&
      presData.conclusion.keyTakeaways.length > 0
        ? `\n\n### 💡 Key Takeaways\n${presData.conclusion.keyTakeaways.slice(0, 4).map((k) => `- ${typeof k === "string" ? k : k.text || ""}`).join("\n")}`
        : "";

    const ctaText = presData.conclusion?.callToAction
      ? `\n\n> 🚀 **Next Steps:** ${presData.conclusion.callToAction}`
      : "";

    const formattedResponse = `
# 📊 ${title}
${subtitle}**Presentation Type:** \`${presType}\` • **Slides:** \`${slideCount} Slides\` • **Author:** ${author}

${overviewText}### 📑 Slide Deck Outline
${slideList || "- Presentation slides generated successfully"}${takeawaysText}${ctaText}

---
[📊 **Download PowerPoint Presentation: ${title}**](${pptUrl})
${isS3 ? "\n*Secure S3 presentation download link generated by AgentFlow AI.*" : ""}
`.trim();

    return {
      ...state,
      aiResponse: formattedResponse,
    };
  } catch (error) {
    console.error("PPT agent error:", error);
    return {
      ...state,
      aiResponse: `⚠️ **PowerPoint Generation Error**\n\nFailed to generate your presentation: ${error.message || "An unexpected error occurred during processing."}\n\nPlease try again with a specific topic or prompt.`,
    };
  }
};

