import z from "@deepseek-ai/schemastery";

import { Context } from "@deepseek-ai/cordis";
import { TAVILY_DEFAULT_URL, TavilySearchProvider } from "./provider";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";

export const name = "web-search-tavily";
export const inject = ["web"];
export interface Config {
    apiKey?: string
    url?: string

    searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast"
    chunksPerSource?: number
    maxResults?: number
}

export const Config: z<Config> = z.object({
    apiKey: z.string(),
    url: z.string(),

    searchDepth: z.union(["basic", "advanced", "fast", "ultra-fast"] as const),
    chunksPerSource: z.number(),
    maxResults: z.number(),
});

export function apply(ctx: Context, config: Config): void {
    ctx.web.registerSearchProvider(
        new TavilySearchProvider({
            apiKey: config.apiKey ?? launchEnvironmentOf(ctx).get("TAVILY_API_KEY")?.value ?? "",
            url: config.url ?? TAVILY_DEFAULT_URL,
            searchDepth: config.searchDepth,
            chunksPerSource: config.chunksPerSource,
            maxResults: config.maxResults,
        }),
    );
}
