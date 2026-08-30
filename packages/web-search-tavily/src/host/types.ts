export type TavilySearchRequest = {
    query: string
    searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast"
    chunksPerSource?: number
    maxResults?: number
};

export type TavilySearchResponse = {
    answer: string
    results: {
        title: string
        url: string
        content: string
    }[]
};

export type TavilyError = {
    detail?: {
        error?: string
    }
};
