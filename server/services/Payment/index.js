import express from "express";
import "dotenv/config";
import connectDB from "./configs/connectDB.js";
import paymentRouter from "./router/payment.router.js";

const app = express();

const port = process.env.PORT || 8004;

connectDB();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Payment API Working Fine");
});

app.use("/", paymentRouter);

app.listen(port, () => {
  console.log(`Payment server running on port ${port}`);
});
