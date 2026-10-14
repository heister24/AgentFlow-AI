import axios from "axios";

const getMessages = async (id) => {
  try {
    const convMsgs = await axios.post(
      `${process.env.CHAT_URL}/get-messages/${id}`,
    );

    return convMsgs;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getMessages;
