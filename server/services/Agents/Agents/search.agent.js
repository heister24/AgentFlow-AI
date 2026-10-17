import tavilySearchTool from "../configs/tavily.js";

export const searchAgent = async (state) => {
  try {
    console.log("Search Agent called")
    const result = await tavilySearchTool.invoke({
      query: state.prompt,
    });
    // console.log(result);
    return {
      ...state,
      searchToolResult: result,
      images: result.images,
    };
  } catch (error) {
    console.error(error);
    return {
      ...state,
      searchToolResult: [],
      images: [],
    };
  }
};
