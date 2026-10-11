import express from "express";
import { agent } from "../controller/agent.controller.js";

const agentRouter = express.Router();

agentRouter.post("/agent-chat", agent);

export default agentRouter;
