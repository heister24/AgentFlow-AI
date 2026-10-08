import api from "../utils/api";

const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default getCurrentUser;
