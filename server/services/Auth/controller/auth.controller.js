import { getAuth } from "firebase-admin/auth";
import { firebaseApp } from "../configs/firebase.js";
import User from "../models/user.model.js";

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

    const sessionId = crypto.randomUUID();
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
        name: user.name,
        email: user.email,
        avatar: user.avatar,
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
