import redis from "../../../shared/redis/redis.js";
import Message from "../../Chat/models/message.model.js";
import getMessages from "../utils/getMessages.js";

export const getMemory = async (id) => {
  try {
    const key = `msgs-${id}`;
    const cachedMsg = await redis.get(key);
    if (cachedMsg) {
      //   console.log("cachedMsg:", cachedMsg);
      return JSON.parse(cachedMsg);
    }

    const msgs = await getMessages(id);
    await redis.set(key, JSON.stringify(msgs), "EX", 30 * 60 * 1000);

    return msgs;
  } catch (error) {
    console.log(error);
  }
};

export const addNewMsgToMemory = async (id, role, content) => {
  const key = `msgs-${id}`;
  const rawMsgs = await redis.get(key);
  const msgs = rawMsgs ? JSON.parse(rawMsgs) : [];

  msgs.push({
    role,
    content,
  });

  if (msgs.length > 25) {
    msgs.shift();
  }

  await redis.set(key, JSON.stringify(msgs), "EX", 30 * 60 * 1000);
};
