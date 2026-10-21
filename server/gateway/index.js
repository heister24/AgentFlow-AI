import express from "express";
import "dotenv/config";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import authMiddleware from "./middleware/authMiddleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { headerWithProxy } from "./utils/headerWithProxy.js";
import morgan from "morgan";

const app = express();

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", proxy(process.env.AUTH_URL));
app.use("/api/chat", authMiddleware, headerWithProxy(process.env.CHAT_URL));
app.use("/api/agent", authMiddleware, headerWithProxy(process.env.AGENT_URL));
app.use("/api/billing",authMiddleware,headerWithProxy(process.env.PAYMENT_URL));
app.get("/api/me", authMiddleware, getCurrentUser);

app.get("/health", (req, res) => {
  res.send("Gateway API working");
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});
