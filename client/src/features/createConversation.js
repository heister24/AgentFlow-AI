import api from "../utils/api";

const createConversation = async (title) => {
  try {
    const chatTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim().slice(0, 25)
        : undefined;
    const { data } = await api.get("/chat/create-conversation", {
      params: chatTitle ? { title: chatTitle } : {},
    });
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
