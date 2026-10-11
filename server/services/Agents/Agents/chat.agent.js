import { getModel } from "../configs/llmModels.js";

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");
    const systemPrompt = "You are AgentFlow-AI, an intelligent assistant";
    const userPrompt = state.prompt;
    const response = await llm.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "human",
        content: userPrompt,
      },
    ]);

    console.log(response.content);
    return {
      ...state,
      aiResponse: response.content.trim(),
    };
  } catch (error) {
    console.log(`Error at chat agent : ${error}`);
  }
};
