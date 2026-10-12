import express from "express";
import {
  createConversation,
  deleteConversationById,
  getAllMessages,
  getConversationById,
  getConversations,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/create-conversation", createConversation);
chatRouter.get("/get-conversations", getConversations);
chatRouter.get("/get-conversation/:id", getConversationById);
chatRouter.delete("/delete-conversation/:id", deleteConversationById);
chatRouter.put("/update-conversation", updateConversation);
chatRouter.post("/save-message", saveMessage);
chatRouter.get("/get-messages/:id", getAllMessages);

export default chatRouter;
