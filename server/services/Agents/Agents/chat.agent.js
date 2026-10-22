import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../configs/llmModels.js";
import { getMemory } from "../configs/memory.js";
import deductCredits from "../utils/deductCredits.js";

const formatSearchContext = (searchToolResult) => {
  if (!searchToolResult) return "";

  const sections = [];

  // 1. Direct answer synthesized by Tavily (crucial for recent sports results, breaking news, etc.)
  if (searchToolResult.answer && typeof searchToolResult.answer === "string") {
    sections.push(`SUMMARY / DIRECT ANSWER:\n${searchToolResult.answer.trim()}`);
  }

  const results = Array.isArray(searchToolResult)
    ? searchToolResult
    : Array.isArray(searchToolResult.results)
      ? searchToolResult.results
      : [];

  if (results.length > 0) {
    const snippets = results.slice(0, 6).map((item, i) => {
      const title = item.title ? `[${i + 1}] ${item.title}` : `[${i + 1}] Source`;
      const url = item.url ? ` (${item.url})` : "";
      const cleanContent = String(item.content || item.snippet || "")
        .replace(/\s+/g, " ")
        .slice(0, 800)
        .trim();

      return `${title}${url}\n${cleanContent}`;
    });

    sections.push(`SOURCE ARTICLES & REPORTS:\n${snippets.join("\n\n")}`);
  }

  if (sections.length === 0) return "";

  return `\n\nWEB SEARCH RESULTS:\n${sections.join("\n\n")}\n\nIMPORTANT: Use the above search results and summary to provide an accurate, up-to-date answer. If reporting a sports match, state the match winner, team totals, key player scores/wickets, and venue.\n`;
};

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");

    let history = [];
    try {
      history = await getMemory(state.conversationId);
    } catch (memErr) {
      console.warn(
        "Could not load memory, proceeding with fresh context:",
        memErr.message,
      );
    }
    const safeHistory = Array.isArray(history) ? history : [];

    // Concise, formatted search context instead of raw multi-kilobyte JSON dump
    const searchContext = formatSearchContext(state.searchToolResult);

    const systemPrompt = `You are AgentFlow-AI, an intelligent assistant.
${searchContext}
FORMATTING:
- Use headings for long or multi-section answers.
- Use bullet points for lists and key takeaways.
- Use numbered lists for step-by-step instructions.
- Use tables when comparing options.
- Use **bold text** to highlight important concepts.
- Use code blocks with appropriate language tags when providing code.
- Keep simple answers concise, direct, and focused without unnecessary fluff.

CONVERSATION STYLE:
- Be friendly, professional, and conversational.
- Match technical depth to the question.
- Focus on the user's actual request.`;

    const userPrompt = state.prompt;

    const msgs = [new SystemMessage(systemPrompt)];

    // Window history to the most recent 6 messages to stay well within TPM limits
    const recentHistory = safeHistory.slice(-6);

    recentHistory.forEach((msg) => {
      if (!msg || typeof msg.content !== "string") return;

      const content =
        msg.content.length > 1500
          ? msg.content.slice(0, 1500) + "..."
          : msg.content;

      if (msg.role === "user") {
        msgs.push(new HumanMessage(content));
      }
      if (msg.role === "assistant") {
        msgs.push(new AIMessage(content));
      }
    });

    msgs.push(new HumanMessage(userPrompt));

    let response;
    try {
      response = await llm.invoke(msgs);
    } catch (llmError) {
      const isRateLimit =
        llmError.status === 413 ||
        llmError.status === 429 ||
        String(llmError.message).includes("413") ||
        String(llmError.message).includes("rate_limit") ||
        String(llmError.message).includes("tokens per minute") ||
        String(llmError.message).includes("TPM");

      if (isRateLimit) {
        console.warn(
          "Primary chat model hit TPM rate limit (413), automatically falling back to backup model...",
        );
        const backupLLM = await getModel("chat_backup");
        response = await backupLLM.invoke(msgs);
      } else {
        throw llmError;
      }
    }

    await deductCredits(state.userId, "chat");

    return {
      ...state,
      aiResponse: response.content.trim(),
    };
  } catch (error) {
    console.error("Error at chat agent:", error);
    throw error;
  }
};
