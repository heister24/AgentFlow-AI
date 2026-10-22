import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embedding = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

