import express from "express";
import "dotenv/config";
import connectDB from "./configs/connectDB.js";
import cookieParser from "cookie-parser";
import chatRouter from "./routes/chat.routes.js";

const app = express();

const port = process.env.PORT || 8002;

await connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send("Chat API working");
});

app.use("/", chatRouter);

app.listen(port, () => {
  console.log(`Chat running on port ${port}`);
});
