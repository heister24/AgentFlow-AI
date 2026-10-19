import { TavilySearch } from "@langchain/tavily"

const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
  includeImages: true,
});

export default  tavilySearchTool