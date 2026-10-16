import { TavilySearch } from "@langchain/tavily"

const tavilySearchTool = new TavilySearch({
    maxResults : 5,
    topic:"general",
    includeImages:true
})

export default  tavilySearchTool