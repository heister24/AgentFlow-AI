import api from "../utils/api";

const createOrder = async (plan) => {
  try {
    const planId = typeof plan === "string" ? plan : plan?.id;
    const response = await api.post("/billing/create-order", { plan: planId });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export default createOrder;
