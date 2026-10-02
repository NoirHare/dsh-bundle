import type { Config } from "./index";

import { WebError, WebSearchProvider, WebSearchRequest, WebSearchResult } from "@deepseek-ai/dsh-web";
import { name } from "./index";
import { unlink } from "fs";

type TailySearchResponse = {
    answer: string;
    results: {
        title: string;
        url: string;
        content: string;
    }[];
};

export const TAILY_DEFAULT_URL = "https://api.tavily.com/search";

const isAbortError = (error: unknown) => {
    return error instanceof DOMException && error.name === "AbortError";
};

const formatError = (e: unknown): string => {
    if (!(e instanceof Error)) return String(e);

    let result = e.message;

    if (e instanceof AggregateError) {
        result += `, errors [${e.errors.map((err) => formatError(err)).join(" | ")}]`;
    }

    if (e.cause !== undefined && e.cause !== null) {
        result += `, cause [${formatError(e.cause)}]`;
    }

    return result;
};

export class TavilyWebSearchProvider implements WebSearchProvider {
    id: string = name;

    constructor(readonly config: ReturnType<typeof Config>) { }

    available(): boolean {
        const keyless = this.config.keyless.get();
        if (keyless) return true;

        const token = this.config.token.get();
        if (!token) return false;
        if (token.trim().length === 0) return false;

        return true;
    }

    async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
        const url = this.config.url.get();
        const token = this.config.token.get();
        const keyless = this.config.keyless.get();

        const searchDepth = this.config.searchDepth.get();
        const chunksPerSource = this.config.chunksPerSource.get();

        let response: Response;
        try {
            response = await fetch(url, {
                method: "POST",
                redirect: "follow",
                headers: {
                    ...(!keyless ? { authorization: `Bearer ${token}` } : { "X-Tavily-Access-Mode": "keyless" }),
                    "content-type": "application/json",
                    accept: "application/json",
                    "user-agent": "deepseek-harness/0.0.1",
                },
                body: JSON.stringify({
                    query: request.query,
                    search_depth: searchDepth,
                    chunks_per_source: chunksPerSource,
                    max_results: request.maxResults,
                    include_answer: true,
                }),
                ...(signal !== undefined ? { signal } : {}),
            });
        } catch (error: unknown) {
            if (isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
            throw new WebError(`Tavily search request failed: ${formatError(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
        }

        if (!response.ok) {
            const status = response.status;
            let message = `Tavily API error (HTTP ${status})`;
            try {
                const error = ((await response.json()) as { detail?: { error?: string } })?.detail?.error;
                if (error !== undefined && error.length > 0) message = error;
            } catch (error: unknown) {
                if (isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
            }
            throw new WebError(message, "WEB_PROVIDER_ERROR");
        }

        try {
            const payload = (await response.json()) as TailySearchResponse;
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
            if (isAbortError(error)) throw new WebError("Taily search aborted", "WEB_ABORTED", { cause: error });
            throw new WebError(`Taily returned an unprocessable response body: ${formatError(error)}`, "WEB_PROVIDER_ERROR", {
                cause: error,
            });
        }
    }
}
