import api from "../utils/api";

const sendRequestToAgent = async (prompt, conversationId) => {
  try {
    const response = await api.post("/agent/agent-chat", {
      prompt,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default sendRequestToAgent;
