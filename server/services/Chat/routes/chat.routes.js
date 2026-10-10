import express from "express";
import {
  createConversation,
  getAllMessages,
  getConversationById,
  getConversations,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/create-conversation", createConversation);
chatRouter.get("/get-conversations", getConversations);
chatRouter.get("/get-conversation/:id", getConversationById);
chatRouter.put("/update-conversation", updateConversation);
chatRouter.post("/save-message", saveMessage);
chatRouter.get("/get-messages/:id", getAllMessages);

export default chatRouter;
