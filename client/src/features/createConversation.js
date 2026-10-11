import api from "../utils/api";

const createConversation = async () => {
  try {
    const { data } = await api.get("/chat/create-conversation");
    // const response = await api.get("/chat/create-conversation");
    //   console.log(response);
    // return response.data
    return data;
  } catch (error) {
    console.log(`Error while creating new chat ${error}`);
  }
};

export default createConversation;
