import api from "../utils/api";

const logoutUser = async () => {
  try {
    const response = await api.get("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error on logout:", error);
    throw error;
  }
};

export default logoutUser;
