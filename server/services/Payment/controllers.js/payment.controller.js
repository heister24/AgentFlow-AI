import crypto from "crypto";
import axios from "axios";
import { PLANS } from "../configs/plans.js";
import razorpay from "../configs/razorpay.js";
import Payment from "../models/payment.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { plan } = req.body;

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    });

    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      currency: "INR",
      credits: selectedPlan.credits,
      plan: selectedPlan.name,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.log(`Error while creating order : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { rzp_orderId, rzp_pymtId, rzp_sig } = req.body;

    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_SECRET_KEY)
      .update(`${rzp_orderId}|${rzp_pymtId}`)
      .digest("hex");

    if (rzp_sig !== generateSignature) {
      return res.status(400).json({
        success: false,
        message:
          "Verification failed due to signature failed to verify with original signature",
      });
    }

    const payment = await Payment.findOne({ orderId: rzp_orderId });
    if (!payment) {
      return res.json({
        message: "Payment not found",
        success: false,
      });
    }

    payment.status = "paid";
    payment.paymentId = rzp_pymtId;
    await payment.save();

    await axios.post(process.env.AUTH_URL + "/updateUserAfterPayment", {
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,
    });

    return res.status(200).json({
      success: true,
      message: "Payment Verified",
    });
  } catch (error) {
    console.log(`Error while verifying payment : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying payment",
    });
  }
};
