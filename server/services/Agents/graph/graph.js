import { START, StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./Router.js";
import { chatAgent } from "../Agents/chat.agent.js";
import { searchAgent } from "../Agents/search.agent.js";
import { codingAgent } from "../Agents/coding.agent.js";
import { imageAgent } from "../Agents/image.agent.js";
import { pdfAgent } from "../Agents/pdf.agent.js";
import { pptAgent } from "../Agents/ppt.agent";

const workflow = new StateGraph(agentState);

workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("image", imageAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);

workflow.addEdge(START, "router");
workflow.addConditionalEdges()
