import { TavilySearch } from "@langchain/tavily";

const tavilySearchTool = new TavilySearch({
  maxResults: 6,
  topic: "general",
  searchDepth: "advanced",
  includeAnswer: true,
  includeImages: true,
});

export default tavilySearchTool;