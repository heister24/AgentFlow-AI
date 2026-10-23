import { getAuth } from "firebase-admin/auth";
import { firebaseApp } from "../configs/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // const decodedToken = getAuth(firebaseApp);
    // decodedToken.verifyIdToken(token);

    let decodedToken;
    try {
      decodedToken = await getAuth(firebaseApp).verifyIdToken(token);
    } catch (error) {
      console.error("Firebase token verification error:", error);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired Firebase ID token",
      });
    }
    // console.log(decodedToken);

    let user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUID: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || "",
        avatar: decodedToken.picture || "",
      });
    }

    if (!user.plan) user.plan = "free";
    if (user.credits === undefined) user.credits = 100;
    if (user.totalCredits === undefined) user.totalCredits = 100;
    await user.save();

    const sessionId = crypto.randomUUID();
    await redis.set(`user-sessionId`, sessionId);
    await redis.set(`user-sessionId-${user._id}`, sessionId);
    await redis.set(
      `sessionId-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpires: user.planExpires || null,
      }),
      "EX",
      7 * 24 * 60 * 60 * 1000,
    );

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION" || false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpires: user.planExpires || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await redis.del(`sessionId-${sessionId}`);
    }
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION" || false,
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const updateUserAfterPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        message: "User not found",
      });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const sessionId =
      (await redis.get(`user-sessionId-${userId}`)) ||
      (await redis.get("user-sessionId"));
    if (sessionId) {
      await redis.set(
        `sessionId-${sessionId}`,
        JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpires: user.planExpires,
        }),
        "EX",
        7 * 24 * 60 * 60 * 1000,
      );
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server err",
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const cost = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10,
      imageAnalyzer: 5,
      pdfRAG: 5,
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        message: "User not found",
      });
    }

    const costOfAgent = cost[agent] || 2;
    // console.log(costOfAgent);  

    if (Number(user.credits) < Number(costOfAgent)) {
      return res.status(402).json({
        success: false,
        message: `Insufficient credits. This request requires ${costOfAgent} credits, but you have ${user.credits}.`,
        credits: user.credits,
        required: costOfAgent,
      });
    }

    user.credits -= costOfAgent;
    await user.save();

    const sessionId =
      (await redis.get(`user-sessionId-${userId}`)) ||
      (await redis.get("user-sessionId"));
    if (sessionId) {
      await redis.set(
        `sessionId-${sessionId}`,
        JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpires: user.planExpires,
        }),
        "EX",
        7 * 24 * 60 * 60 * 1000,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Deducted Successful",
      credits: user.credits,
    });
  } catch (error) {
    console.error("Credit deduction error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
