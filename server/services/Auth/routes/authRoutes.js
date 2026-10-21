import express from "express";
import {
  deductCredits,
  login,
  logout,
  updateUserAfterPayment,
} from "../controller/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google-login", login);
authRouter.get("/logout", logout);
authRouter.post("/updateUserAfterPayment", updateUserAfterPayment);
authRouter.post("/deduct-credits", deductCredits);

export default authRouter;
