import express from "express";
import "dotenv/config";
import connectDB from "./configs/connectDB.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

const port = process.env.PORT || 8001;

await connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send("Auth API working");
});

app.use("/", authRouter);

app.listen(port, () => {
  console.log(`Auth running on port ${port}`);
});
