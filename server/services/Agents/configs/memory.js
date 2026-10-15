import redis from "../../../shared/redis/redis.js";
import Message from "../../Chat/models/message.model.js";
import getMessages from "../utils/getMessages.js";

const CACHE_TTL = 30 * 60; // 30 minutes in seconds
const MAX_MESSAGES = 25;

export const getMemory = async (id) => {
  const key = `msgs-${id}`;
  const cachedMsg = await redis.get(key);
  if (cachedMsg !== null) {
    const parsedMsgs = JSON.parse(cachedMsg);
    if (Array.isArray(parsedMsgs)) {
      return parsedMsgs;
    }
  }

  const msgs = await getMessages(id);
  await redis.set(key, JSON.stringify(msgs), "EX", CACHE_TTL);

  return msgs;
};

export const addNewMsgToMemory = async (id, role, content) => {
  try {
    const key = `msgs-${id}`;
    const rawMsgs = await redis.get(key);
    const parsedMsgs = rawMsgs ? JSON.parse(rawMsgs) : null;
    const msgs = Array.isArray(parsedMsgs) ? parsedMsgs : await getMemory(id);

    msgs.push({
      role,
      content,
    });

    if (msgs.length > MAX_MESSAGES) {
      msgs.splice(0, msgs.length - MAX_MESSAGES);
    }

    await redis.set(key, JSON.stringify(msgs), "EX", CACHE_TTL);
    return msgs;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
