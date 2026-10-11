import axios from "axios";
import { graph } from "../graph/graph.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;
    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // graph return ste state that we added in state.js
    const response = await graph.invoke({
      prompt,
      conversationId,
    });

    const aiResponse = response.aiResponse;
    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    return res.status(200).json({
      aiResponse: aiResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
