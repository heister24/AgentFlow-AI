import express from "express";
import "dotenv/config";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import authMiddleware from "./middleware/authMiddleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";

const app = express();

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_URL));
app.get("/api/me", authMiddleware, getCurrentUser);

app.get("/health", (req, res) => {
  res.send("Gateway API working");
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});
