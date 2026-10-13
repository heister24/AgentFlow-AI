import api from "../utils/api";

const getConversationById = async (id) => {
  try {
    const response = await api.get(`/chat/get-conversation/${id}`);
    console.log("Conversation:", response.data.conversation);
    console.log("Msgs:", response.data.messages);
    return response.data;
  } catch (error) {
    console.log(`Error while fetching  conversation : ${error}`);
  }
};

export default getConversationById;
