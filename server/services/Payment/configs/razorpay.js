import Razorpay from "razorpay";
import "dotenv/config";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_API_KEY,
  key_secret:
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_SECRET_KEY,
});

export default razorpay;
