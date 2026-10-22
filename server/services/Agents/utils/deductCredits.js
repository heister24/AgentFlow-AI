import axios from "axios";

const deductCredits = async (userId, agent) => {
  const response = await axios.post(`${process.env.AUTH_URL}/deduct-credits`, {
    userId,
    agent,
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Insufficient credits");
  }
  return response.data;
};

export default deductCredits;
