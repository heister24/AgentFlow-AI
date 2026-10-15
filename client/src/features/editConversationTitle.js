import api from "../utils/api";

const editConversationTitle = async (title, conversationId) => {
  try {
    const response = await api.put("/chat/update-conversation", {
      title,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error while updating conversation title:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export default editConversationTitle;
