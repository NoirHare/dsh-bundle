import { WebError, WebSearchProvider, WebSearchRequest, WebSearchResult } from "@deepseek-ai/dsh-web";
import { Config, name } from ".";
import { SettingsScope } from "@deepseek-ai/dsh-settings";

type TailySearchResponse = {
    answer: string
    results: {
        title: string
        url: string
        content: string
    }[]
};

export const TAILY_DEFAULT_URL = "https://api.tavily.com/search";

const isAbortError = (error: unknown) => {
    return error instanceof DOMException && error.name === "AbortError";
};

export class TailyWebSearchProvider implements WebSearchProvider {
    readonly id = name;

    constructor(readonly settings: SettingsScope<Config>) { }

    available(): boolean {
        const config = this.settings.get();

        if (!config.token) return false;
        if (config.token.trim().length === 0) return false;

        return true;
    }

    async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
        const config = this.settings.get();

        let response: Response;
        try {
            response = await fetch(config.url, {
                method: "POST",
                redirect: "follow",
                headers: {
                    ...(!config.keyless
                        ? { authorization: `Bearer ${config.token}` }
                        : { "X-Tavily-Access-Mode": "keyless" }),
                    "content-type": "application/json",
                    "accept": "application/json",
                    "user-agent": "deepseek-harness/0.0.1",
                },
                body: JSON.stringify({
                    query: request.query,
                    search_depth: config.searchDepth,
                    chunks_per_source: config.chunksPerSource,
                    max_results: request.maxResults,
                    include_answer: true,
                }),
                ...signal !== undefined ? { signal } : {},
            });
        } catch (error: unknown) {
            if (isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
            throw new WebError(`Tavily search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
        }

        if (!response.ok) {
            const status = response.status;
            let message = `Tavily API error (HTTP ${status})`;
            try {
                const error = (await response.json() as { detail?: { error?: string } })?.detail?.error;
                if (error !== undefined && error.length > 0) message = error;
            } catch (error: unknown) {
                if (isAbortError(error)) throw new WebError("Exa search aborted", "WEB_ABORTED", { cause: error });
            }
            throw new WebError(message, "WEB_PROVIDER_ERROR");
        }

        try {
            const payload = await response.json() as TailySearchResponse;
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
            throw new WebError(`Taily returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
        }
    }
}
