import api from "../utils/api";

const deleteConversationById = async (id) => {
  try {
    const response = await api.delete(`/chat/delete-conversation/${id}`);
    console.log(response)
  } catch (error) {
    console.log(`Error while deleting error:${error}`);
  }
};

export default deleteConversationById;
