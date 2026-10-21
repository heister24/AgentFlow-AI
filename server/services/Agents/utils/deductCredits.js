import axios from "axios";

const deductCredits = async (userId, agent) => {
  try {
    const response = await axios.post(
      `${process.env.AUTH_URL}/deduct-credits`,
      { userId, agent },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default deductCredits;
