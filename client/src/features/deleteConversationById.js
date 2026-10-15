import api from "../utils/api";

const deleteConversationById = async (id) => {
  try {
    const response = await api.delete(`/chat/delete-conversation/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error while deleting conversation:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export default deleteConversationById;
