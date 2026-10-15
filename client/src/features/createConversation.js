import api from "../utils/api";

const createConversation = async () => {
  try {
    const { data } = await api.get("/chat/create-conversation");
    return data.conversation;
  } catch (error) {
    console.error(
      "Error while creating new chat:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export default createConversation;
