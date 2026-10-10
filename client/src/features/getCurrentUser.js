import api from "../utils/api";

const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getCurrentUser;
