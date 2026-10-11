import api from "../utils/api";

const getAllConversations = async () => {
  try {
    const response = await api.get("/chat/get-conversations");

    return response.data;
  } catch (error) {
    console.log(`Error while fetching all conversations : ${error}`);
  }
};

export default getAllConversations;
