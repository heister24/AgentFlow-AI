import api from "../utils/api";

const editConversationTitle = async (title, conversationId) => {
  try {
    const response = await api.put("/chat/update-conversation", {
      title,
      conversationId,
    });
    console.log(response);
  } catch (error) {
    console.log(`Error while updating title : ${error}`);
  }
};

export default editConversationTitle;
