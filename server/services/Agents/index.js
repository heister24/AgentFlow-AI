import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./configs/connectDB.js";
import agentRouter from "./routes/agent.routes.js";

const app = express();

const port = process.env.PORT || 8003;

await connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send("Agent API running");
});

app.use("/", agentRouter);

app.listen(port, () => {
  console.log(`Agent Server running on port ${port}`);
});
