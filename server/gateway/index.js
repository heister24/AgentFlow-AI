import express from "express";
import "dotenv/config";
import proxy from "express-http-proxy";
import cors from "cors";

const app = express();

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api/auth", proxy(process.env.AUTH_URL));

app.get("/health", (req, res) => {
  res.send("Gateway API working");
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});
