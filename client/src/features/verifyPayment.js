import api from "../utils/api";

const verifyPayment = async (rzp_orderId, rzp_pymtId, rzp_sig) => {
  try {
    const response = await api.post("/billing/verify-payment", {
      rzp_orderId,
      rzp_pymtId,
      rzp_sig,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export default verifyPayment;
