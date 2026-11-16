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

// Enable trust proxy for AWS ALB / CloudFront / Nginx reverse proxies
app.set("trust proxy", 1);

// Configure flexible CORS for single or comma-separated origins
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawClientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === "*") return true;
        return origin === allowed || origin.replace(/\/$/, "") === allowed;
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);

app.use(cookieParser());
app.use(
  morgan(
    process.env.NODE_ENV?.toLowerCase() === "production" ? "combined" : "dev",
  ),
);

// Microservices Proxy Routing
app.use("/api/auth", proxy(process.env.AUTH_URL || "http://localhost:8001"));
app.use(
  "/api/chat",
  authMiddleware,
  headerWithProxy(process.env.CHAT_URL || "http://localhost:8002"),
);
app.use(
  "/api/agent",
  authMiddleware,
  headerWithProxy(process.env.AGENT_URL || "http://localhost:8003"),
);
app.use(
  "/api/billing",
  authMiddleware,
  headerWithProxy(process.env.PAYMENT_URL || "http://localhost:8004"),
);
app.get("/api/me", authMiddleware, getCurrentUser);

// Production Health Check Endpoint for AWS ALB / ECS
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "gateway",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});

