import api from "../utils/api";

const getConversationById = async (id) => {
  try {
    const response = await api.get(`/chat/get-conversation/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default getConversationById;
