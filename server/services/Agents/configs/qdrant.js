import { QdrantVectorStore } from "@langchain/qdrant";
import { embedding } from "./embeddings.js";
import "dotenv/config";

export const vectorStore = async (document, collectionName) => {
  return await QdrantVectorStore.fromDocuments(document, embedding, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName,
  });
};
