import { getModel } from "../configs/llmModels.js";
import axios from "axios";
import { uploadOnS3 } from "../utils/uploadOnS3.js";
import { getDataFromS3 } from "../utils/getDataFromS3.js";

export const imageAgent = async (state) => {
  try {
    console.log("Image agent responding");
    const llm = await getModel("chat");
    const res = await llm.invoke(`
            You are an elite AI image prompt engineer.

            Convert the user request into a highly detailed image generation prompt.

            Requirements:
            - Cinematic lighting
            - Professional composition
            - Ultra realistic
            - High detail
            - Beautiful color palette
            - Sharp focus
            - 8K quality
            - Photorealistic
            - Depth of field
            - Professional photography
            - Stunning visuals

            Return only the image prompt.

            User Request:
            ${state.prompt}
            `);
    const resultPrompt = res.content.trim();
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(resultPrompt)}?nologo=true`;

    const imgResponse = await axios.get(imgUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(imgResponse.data);
    const contentType = imgResponse.headers["content-type"] || "image/png";
    const extension =
      contentType.includes("jpeg") || contentType.includes("jpg")
        ? "jpg"
        : "png";
    const filename = `image-${Date.now()}.${extension}`;

    let displayUrl = imgUrl;
    let isS3 = false;

    try {
      await uploadOnS3(filename, buffer, contentType);
      displayUrl = await getDataFromS3(filename, 5 * 60);
      isS3 = true;
    } catch (s3Error) {
      console.warn(
        "S3 upload failed (check AWS IAM permissions), falling back to direct image URL:",
        s3Error.message,
      );
    }

    const cleanPrompt = (state.prompt || "AI Artwork")
      .replace(/["\n\r[\]]/g, " ")
      .trim();

    return {
      ...state,
      aiResponse: `
![${cleanPrompt}](${displayUrl})
${isS3 ? "\n*Storage link expires in 50 minutes.*" : ""}
      `.trim(),
    };
  } catch (error) {
    console.error("Image generation error:", error);
    return {
      ...state,
      aiResponse: "Failed to generate image",
    };
  }
};
