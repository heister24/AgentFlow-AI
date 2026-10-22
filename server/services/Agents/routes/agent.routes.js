import express from "express";
import { agent } from "../controller/agent.controller.js";
import multer from "../configs/multer.js";

const agentRouter = express.Router();

agentRouter.post("/agent-chat", multer.single("file"), agent);

export default agentRouter;
