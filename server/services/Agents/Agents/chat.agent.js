import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../configs/llmModels.js";
import { getMemory } from "../configs/memory.js";

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");

    const history = await getMemory(state.conversationId);
    const safeHistory = Array.isArray(history) ? history : [];

    const searchContext = state.searchToolResult
      ? `Web Search Result:
            ${JSON.stringify(state.searchToolResult)} 
            Answer user using only above search result`
      : "";

    const systemPrompt = `You are AgentFlow-AI, an intelligent assistant

          ${searchContext}
          If search context available then use search result to answer and do not  mention internal tools.
          
          FORMATTING:
                - Use headings for long or multi-section answers.
                - Use bullet points for lists and key takeaways.
                - Use numbered lists for step-by-step instructions.
                - Use tables when comparing multiple options.
                - Use **bold text** to highlight important concepts.
                - Use code blocks with the appropriate language identifier for code. If code is requested and no language is specified, default to JavaScript (Node.js/frontend).
                - Keep simple answers concise, direct, and focused without unnecessary fluff.
                - Use mathematical notation when it improves clarity.
                - Avoid excessive emojis and unnecessary decorative formatting.

                CONVERSATION STYLE:
                - Be friendly, professional, and conversational.
                - Avoid robotic or overly formal responses.
                - Do not repeat the user's question unnecessarily.
                - Match the user's preferred language when appropriate.
                - For beginners, explain concepts step by step.
                - For experienced developers, prioritize technical depth and efficiency.

                RESPONSE QUALITY:
                - Answer the main question first.
                - Provide examples when they improve understanding.
                - Include actionable next steps when useful.
                - Keep responses focused on the user's actual request.

                One important note if user ask normal question then dont give long answer.`;

    const userPrompt = state.prompt;

    const msgs = [new SystemMessage(systemPrompt)];

    safeHistory.forEach((msg) => {
      if (!msg || typeof msg.content !== "string") return;

      if (msg.role === "user") {
        msgs.push(new HumanMessage(msg.content));
      }
      if (msg.role === "assistant") {
        msgs.push(new AIMessage(msg.content));
      }
    });

    msgs.push(new HumanMessage(userPrompt));

    const response = await llm.invoke(msgs);

    // console.log(response.content);
    return {
      ...state,
      aiResponse: response.content.trim(),
    };
  } catch (error) {
    console.error("Error at chat agent:", error);
    throw error;
  }
};
