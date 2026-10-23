import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const rawTitle = req.query?.title || req.body?.title;
    const title =
      typeof rawTitle === "string" && rawTitle.trim().length > 0
        ? rawTitle.trim().slice(0, 25)
        : undefined;

    const conversation = await Conversation.create({
      userId: userId,
      ...(title ? { title } : {}),
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
    const messages = await Message.find({ conversationId: conversationId }).sort({
      createdAt: 1,
    });
    return res.status(200).json({ conversation, messages });
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
    const { title, conversationId, onlyIfDefault } = req.body;

    if (typeof title !== "string" || !title.trim() || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "title and conversationId are required",
      });
    }

    const trimmedTitle = title.trim().slice(0, 25);

    const filter = { _id: conversationId };
    if (onlyIfDefault) {
      filter.$or = [
        { title: "New Chat" },
        { title: { $exists: false } },
        { title: "" },
      ];
    }

    const conversation = await Conversation.findOneAndUpdate(
      filter,
      { title: trimmedTitle },
      { new: true, runValidators: true },
    );

    if (!conversation) {
      return res.status(onlyIfDefault ? 200 : 404).json({
        success: false,
        message: onlyIfDefault
          ? "Title already customized"
          : "Conversation not found",
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error while updating conversation title:", error);
    return res.status(500).json({
      success: false,
      message: "error while update conversation title",
    });
  }
};

export const deleteConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.headers["x-user-id"];

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (userId && conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this conversation",
      });
    }

    await Message.deleteMany({ conversationId });
    const deletedConversation =
      await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({
      success: true,
      message: "Conversation Deleted",
      conversation: deletedConversation,
    });
  } catch (error) {
    console.log(`Error while deleting conversation : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Error while deleting conversation",
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts, fileName } =
      req.body;
    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts,
      fileName,
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
    }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.log(`Get All Message Error : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Get All Message error",
    });
  }
};
