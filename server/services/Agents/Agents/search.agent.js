import tavilySearchTool from "../configs/tavily.js";
import deductCredits from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  try {
    console.log("Search Agent called for prompt:", state.prompt);

    const isNewsOrSports =
      /\b(today|todays|yesterday|tonight|recent|latest|breaking|live|news|match|score|scores|cricket|t20|t20i|odi|test|ipl|wpl|football|fifa|nba|winner|result|results|election)\b/i.test(
        state.prompt,
      );

    // Ground temporal words like "today", "yesterday", "tonight" with the actual calendar date
    // so search engines don't match old articles from previous dates that happened to use the word "today".
    const hasTemporalWords = /\b(today|todays|tonight)\b/i.test(state.prompt);
    let effectiveQuery = state.prompt;
    if (hasTemporalWords) {
      const todayDateStr = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      effectiveQuery = `${state.prompt} (${todayDateStr})`;
    }

    let result;
    try {
      result = await tavilySearchTool.invoke({
        query: effectiveQuery,
        topic: isNewsOrSports ? "news" : "general",
      });
    } catch (searchErr) {
      console.warn("Primary search invocation failed, falling back to general:", searchErr?.message);
      result = await tavilySearchTool.invoke({
        query: state.prompt,
        topic: "general",
      });
    }

    // If news search returned 0 results, retry with general topic
    if ((!result?.results || result.results.length === 0) && isNewsOrSports) {
      console.log("News topic returned 0 results, retrying with general topic...");
      try {
        result = await tavilySearchTool.invoke({
          query: state.prompt,
          topic: "general",
        });
      } catch (fallbackErr) {
        console.warn("Fallback general search failed:", fallbackErr?.message);
      }
    }

    await deductCredits(state.userId, "search");

    return {
      ...state,
      searchToolResult: result,
      images: result?.images || [],
    };
  } catch (error) {
    console.error("Error in searchAgent:", error);
    return {
      ...state,
      searchToolResult: null,
      images: [],
    };
  }
};
