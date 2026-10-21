import axios from "axios";
import { graph } from "../graph/graph.js";
import { addNewMsgToMemory } from "../configs/memory.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req.headers["x-user-id"];

    if (typeof prompt !== "string" || !prompt.trim() || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "prompt and conversationId are required",
      });
    }

    // graph return ste state that we added in state.js
    const response = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
    });

    const aiResponse = response.aiResponse;

    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    await addNewMsgToMemory(conversationId, "user", prompt);

    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
      images: response?.images,
      artifacts: response?.artifacts,
    });

    await addNewMsgToMemory(conversationId, "assistant", aiResponse);

    return res.status(200).json({
      aiResponse: aiResponse,
      images: response?.images,
      artifacts: response?.artifacts,
    });
  } catch (error) {
    console.error(
      "Agent controller error:",
      error.response?.data || error.stack || error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process agent request",
    });
  }
};
