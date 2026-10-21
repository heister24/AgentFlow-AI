import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../configs/llmModels.js";
import { getMemory } from "../configs/memory.js";
import { extractFilesFromMarkdown } from "../utils/artifactExtractor.js";
import deductCredits from "../utils/deductCredits.js";

export const codingAgent = async (state) => {
  try {
    console.log("Coding agent called for prompt:", state.prompt);
    const intentLLM = await getModel("intent");
    const codingLLM = await getModel("coding");

    let intent = "CODE_GENERATION";
    try {
      const intentResponse = await intentLLM.invoke(`
You are an intent classifier for a software development assistant.
Classify the user's request into one of these exact categories:
- CODE_GENERATION
- CODE_REVIEW
- CODE_EXPLANATION
- DEBUGGING
- OPTIMIZATION
- CONVERSION
- DOCUMENTATION

Rules:
Return ONLY the category name in uppercase. No punctuation, no extra words.

User Request: ${state.prompt}
      `);
      intent = (intentResponse.content || "").trim().toUpperCase();
      console.log("Classified coding intent:", intent);
    } catch (classifyErr) {
      console.warn(
        "Intent classification fallback to CODE_GENERATION:",
        classifyErr.message,
      );
    }

    const history = state.conversationId
      ? await getMemory(state.conversationId)
      : [];
    const safeHistory = Array.isArray(history) ? history : [];

    const systemPrompt = `You are AgentFlow AI, an expert AI software engineer and coding assistant.

## CORE PRINCIPLES
1. **DEFAULT LANGUAGE PREFERENCE**:
   - Unless the user explicitly specifies another programming language, **always default to JavaScript / TypeScript** (Node.js for backend/scripts, modern JS/ES6+ for frontend and logic).
   - Do NOT use Python unless the user specifically asks for Python.

2. **CONCISENESS & NO UNNECESSARY FLUFF**:
   - Be direct, concise, and strictly answer what is asked.
   - Avoid unsolicited background essays, long theoretical lectures, repetitive intros/outros, or textbook explanations.
   - If the user asks for code, a function, or a bug fix, jump straight to the solution with a brief, high-signal explanation.

3. **CODE COMPLETENESS**:
   - Provide clean, functional, and modern code.
   - Never use lazy placeholders like "// rest of code goes here" or pseudo-code.

## CRITICAL FILE OUTPUT RULES
Whenever you generate code files, complete projects, or script solutions:
1. Always specify the relative file path / name immediately before each code block using this exact header format:
### File: \`filename.ext\`
2. Then provide the full, working implementation in a standard fenced code block with the appropriate language identifier:
\`\`\`language
// complete code
\`\`\`
3. For multi-file projects (e.g. HTML/CSS/JS or full-stack/React apps), output EVERY file separately with its own file header:
### File: \`index.html\`
\`\`\`html
<!DOCTYPE html>
<html lang="en">
...
</html>
\`\`\`

### File: \`style.css\`
\`\`\`css
/* styles */
\`\`\`

### File: \`script.js\`
\`\`\`javascript
// logic
\`\`\`
`;

    const msgs = [new SystemMessage(systemPrompt)];

    safeHistory.forEach((msg) => {
      if (!msg || typeof msg.content !== "string") return;
      if (msg.role === "user") {
        msgs.push(new HumanMessage(msg.content));
      } else if (msg.role === "assistant") {
        msgs.push(new AIMessage(msg.content));
      }
    });

    msgs.push(new HumanMessage(state.prompt));

    const response = await codingLLM.invoke(msgs);
    const content =
      typeof response.content === "string" ? response.content : "";

    const extractedFiles = extractFilesFromMarkdown(content);
    console.log(
      `Extracted ${extractedFiles.length} file(s) for artifact from response.`,
    );

    const artifacts =
      extractedFiles.length > 0
        ? [
            {
              id: Date.now(),
              type: "Project",
              files: extractedFiles,
            },
          ]
        : [];

    await deductCredits(state.userId, "coding");

    return {
      ...state,
      aiResponse: content,
      artifacts,
    };
  } catch (error) {
    console.error("Error at coding agent:", error);
    throw error;
  }
};
