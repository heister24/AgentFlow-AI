import api from "../utils/api";

const sendRequestToAgent = async (prompt, conversationId) => {
  try {
    const response = await api.post("/agent/agent-chat", {
      prompt,
      conversationId,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Agent request failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export default sendRequestToAgent;
