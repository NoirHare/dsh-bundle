import { WebError, WebSearchProvider, WebSearchRequest, WebSearchResult } from "@deepseek-ai/dsh-web";
import type { TavilyError, TavilySearchResponse } from "./types";

export const TAVILY_PROVIDER_ID = "tavily";

export const TAVILY_DEFAULT_URL = "https://api.tavily.com/search";

const USER_AGENT = "deepseek-harness/0.0.1";

export interface TavilySearchProviderOptions {
    apiKey: string
    url: string
    searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast"
    chunksPerSource?: number
    maxResults?: number
}

export class TavilySearchProvider implements WebSearchProvider {
    readonly id = TAVILY_PROVIDER_ID;

    constructor(private readonly options: TavilySearchProviderOptions) {}

    available(): boolean {
        return this.options.apiKey.length > 0 && URL.canParse(this.options.url);
    }

    async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
        const maxResults = request.maxResults ?? this.options.maxResults;
        let response: Response;
        try {
            response = await fetch(this.options.url, {
                method: "POST",
                redirect: "error",
                headers: {
                    "authorization": `Bearer ${this.options.apiKey}`,
                    "content-type": "application/json",
                    "accept": "application/json",
                    "user-agent": USER_AGENT,
                },
                body: JSON.stringify({
                    query: request.query,
                    search_depth: this.options.searchDepth,
                    chunks_per_source: this.options.chunksPerSource,
                    max_results: maxResults,
                    include_answer: true,
                }),
                ...signal !== undefined ? { signal } : {},
            });
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
            }
            throw new WebError(`Tavily search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
        }

        if (!response.ok) {
            const status = response.status;
            let message = `Tavily API error (HTTP ${status})`;
            try {
                const error = (await response.json() as TavilyError).detail?.error;
                if (error !== undefined && error.length > 0) message = error;
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
                }
            }
            throw new WebError(message, "WEB_PROVIDER_ERROR");
        }

        try {
            const payload = await response.json() as TavilySearchResponse;
            return {
                content: payload.answer,
                sources: payload.results.map((r) => ({
                    url: r.url,
                    title: r.title,
                    snippet: r.content,
                })),
                truncated: true,
            };
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
            }
            throw new WebError(`Tavily returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
        }
    }
}
