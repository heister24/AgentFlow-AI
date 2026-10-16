import { END, START, StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./Router.js";
import { chatAgent } from "../Agents/chat.agent.js";
import { searchAgent } from "../Agents/search.agent.js";
import { codingAgent } from "../Agents/coding.agent.js";
import { imageAgent } from "../Agents/image.agent.js";
import { pdfAgent } from "../Agents/pdf.agent.js";
import { pptAgent } from "../Agents/ppt.agent.js";

const workflow = new StateGraph(agentState);

workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("image", imageAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);

workflow.addEdge(START, "router");
workflow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "chat":
        return "chat";
      case "search":
        return "search";
      case "coding":
        return "coding";
      case "image":
        return "image";
      case "ppt":
        return "ppt";
      case "pdf":
        return "pdf";

      default:
        return "chat";
    }
  },
  {
    chat: "chat",
    search: "search",
    coding: "coding",
    image: "image",
    ppt: "ppt",
    pdf: "pdf",
  },
);

workflow.addEdge("search", "chat");
workflow.addEdge("chat", END);
workflow.addEdge("coding", END);
workflow.addEdge("pdf", END);
workflow.addEdge("ppt", END);
workflow.addEdge("image", END);

export const graph = workflow.compile();
