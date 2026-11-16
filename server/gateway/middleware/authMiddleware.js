import redis from "../../shared/redis/redis.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const sessionId = req.cookies?.sessionId || bearerToken;
    // console.log(sessionId);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const session = await redis.get(`sessionId-${sessionId}`);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session Expired",
      });
    }
    req.user = JSON.parse(session);
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default authMiddleware;
