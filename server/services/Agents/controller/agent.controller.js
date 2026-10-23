import fs from "fs";
import axios from "axios";
import { graph } from "../graph/graph.js";
import { addNewMsgToMemory } from "../configs/memory.js";
import { uploadOnS3 } from "../utils/uploadOnS3.js";
import { getDataFromS3 } from "../utils/getDataFromS3.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req.headers["x-user-id"];
    const file = req.file;

    if (typeof prompt !== "string" || !prompt.trim() || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "prompt and conversationId are required",
      });
    }

    // Process user attachment (image or PDF)
    let userImages = [];
    if (file && file.mimetype?.startsWith("image/")) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const filename = `user-${Date.now()}-${file.originalname}`;
        await uploadOnS3(filename, fileBuffer, file.mimetype);
        const signedUrl = await getDataFromS3(filename, 7 * 24 * 3600);
        userImages = [signedUrl];
      } catch (s3Err) {
        console.warn(
          "S3 upload failed for user image, saving base64 data URL fallback:",
          s3Err.message,
        );
        try {
          const fileBuffer = fs.readFileSync(file.path);
          userImages = [
            `data:${file.mimetype};base64,${fileBuffer.toString("base64")}`,
          ];
        } catch (readErr) {
          console.warn("Failed reading file for base64:", readErr.message);
        }
      }
    }

    // graph return the state that we added in state.js
    const response = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file,
    });

    const aiResponse = response.aiResponse;

    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
      fileName: file ? file.originalname : undefined,
      images: userImages,
    });

    await addNewMsgToMemory(conversationId, "user", prompt);

    await axios.post(`${process.env.CHAT_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
      images: response?.images,
      artifacts: response?.artifacts,
    });

    await addNewMsgToMemory(conversationId, "assistant", aiResponse);

    // Auto-update conversation title to search prompt sliced to 25 characters
    const chatTitle = prompt.trim().slice(0, 25);
    try {
      await axios.put(`${process.env.CHAT_URL}/update-conversation`, {
        conversationId,
        title: chatTitle,
        onlyIfDefault: true,
      });
    } catch (titleErr) {
      console.warn("Auto-updating conversation title skipped:", titleErr.message);
    }

    return res.status(200).json({
      aiResponse: aiResponse,
      images: response?.images,
      artifacts: response?.artifacts,
      userImages,
      fileName: file ? file.originalname : undefined,
      conversationTitle: chatTitle,
    });
  } catch (error) {
    console.error(
      "Agent controller error:",
      error.response?.data || error.stack || error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process agent request",
    });
  } finally {
    if (req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Failed to remove uploaded file:", cleanupError);
        }
      }
    }
  }
};
