import axios from "axios";

const getMessages = async (id) => {
  const convMsgs = await axios.get(
    `${process.env.CHAT_URL}/get-messages/${id}`,
  );

  if (!Array.isArray(convMsgs.data)) {
    throw new TypeError("Chat service returned an invalid message history");
  }

  return convMsgs.data;
};

export default getMessages;
