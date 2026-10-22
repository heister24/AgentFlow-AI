import api from "../utils/api";

const sendRequestToAgent = async (formData) => {
  try {
    const response = await api.post("/agent/agent-chat", formData);
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
