import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogle } from "@langchain/google";
import { ChatOpenRouter } from "@langchain/openrouter";

const groqLLM = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7,
  maxRetries: 5,
});

const geminiLLM = new ChatGoogle({
  model: "gemini-3.1-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const openRouterLLM = new ChatOpenRouter({
  model: "deepseek/deepseek-v4.1-flash",
  apiKey: process.env.OPENROUTER_API_KEY,
  temperature: 0,
  maxTokens: 8192,
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groqLLM;
    case "search":
      return groqLLM;
    case "coding":
      return openRouterLLM;
    default:
      return groqLLM;
  }
};
