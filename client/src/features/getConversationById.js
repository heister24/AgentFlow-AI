import api from "../utils/api";

const getConversationById = async (id) => {
  try {
    const response = await api.get(`/chat/get-conversation/${id}`);
    console.log("Conversation:", response.data.conversation);
    return response.data.conversation;
  } catch (error) {
    console.log(`Error while fetching  conversation : ${error}`);
  }
};

export default getConversationById;
