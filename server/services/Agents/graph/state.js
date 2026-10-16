import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
  prompt: Annotation(),
  aiResponse: Annotation(),
  agent: Annotation(),
  conversationId: Annotation(),
  searchToolResult: Annotation(),
  images: Annotation(),
});
