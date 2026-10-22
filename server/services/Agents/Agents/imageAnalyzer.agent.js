import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../configs/llmModels.js";
import deductCredits from "../utils/deductCredits.js";
import fs from "fs";

export const imageAnalyzerAgent = async (state) => {
  try {
    if (!state.file || !state.file.path) {
      throw new Error("No image file provided for analysis.");
    }

    const llm = await getModel("imageAnalyzer");

    const imageBuffer = fs.readFileSync(state.file.path);
    const base64IMG = imageBuffer.toString("base64");
    const mimeType = state.file.mimetype || state.file.mimeType || "image/jpeg";

    const msgs = [
      new SystemMessage(`
        You are an expert image analysis assistant.

        Your task is to analyze the image provided by the user and answer
        their question accurately based on the visual information.

        Instructions:
        - Carefully examine the image before responding.
        - Describe relevant objects, people, text, scenes, and activities.
        - If the user asks a specific question, focus on answering it directly.
        - Extract and transcribe visible text when requested.
        - If the image contains a chart, diagram, or document, explain its
          relevant information clearly.
        - Do not invent details that are not visible in the image.
        - If something is unclear or unreadable, explicitly mention it.
        - Keep the response clear, structured, and concise.
        - If the image does not contain enough information to answer,
          explain the limitation.
      `),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64IMG}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(msgs);

    console.log(response.content);

    if (state.userId) {
      await deductCredits(state.userId, "imageAnalyzer");
    }

    return {
      ...state,
      aiResponse: response.content,
      imageAnalysis: response.content,
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw error;
  }
};

