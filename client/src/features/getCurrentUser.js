import api from "../utils/api";

const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    return null;
  }
};

export default getCurrentUser;
