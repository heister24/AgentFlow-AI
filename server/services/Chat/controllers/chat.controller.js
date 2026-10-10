import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    // console.log("Chat service headers:", req.headers);
    // console.log("Received user ID:", req.headers["x-user-id"]);
    const userId = req.headers["x-user-id"];
    // console.log(userId);

    const conversation = await Conversation.create({
      userId: userId,
    });
    return res.status(201).json({
      success: true,
      message: "Conversation Created",
      conversation,
    });
  } catch (error) {
    console.log(`Error While creating conversation : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Conversation creation error",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({ userId: userId }).sort({
      updatedAt: -1,
    });
    return res.status(200).json(conversations);
  } catch (error) {
    console.log(`Error While fetching conversations : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Get Conversations  error",
    });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);
    return res.status(200).json(conversation);
  } catch (error) {
    console.log(`Error While fetching specific conversation : ${error}`);
    return res.status(500).json({
      success: false,
      message: " Get specific Conversations error",
    });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { title, conversationId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(conversationId, {
      title,
    });
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while update conversation title",
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const message = await Message.create({
      conversationId,
      role,
      content,
    });
    return res.status(200).json(message);
  } catch (error) {
    console.log(`Save Message Error : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Save Message error",
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    }).sort({ updatedAt: -1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.log(`Get All Message Error : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Get All Message error",
    });
  }
};
