import api from "../utils/api";

const getAllConversations = async () => {
  try {
    const response = await api.get("/chat/get-conversations");

    return Array.isArray(response.data)
      ? response.data
      : (response.data?.conversations ?? []);
  } catch (error) {
    console.error(
      "Error while fetching all conversations:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
export default getAllConversations;
