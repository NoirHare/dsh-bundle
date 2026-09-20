import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-settings";
import type {} from "@deepseek-ai/dsh-web";

import z from "@deepseek-ai/schemastery";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { TAILY_DEFAULT_URL, TavilyWebSearchProvider } from "./provider";

export type Config = {
    url: string;
    token?: string;
    keyless: boolean;

    searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast";
    chunksPerSource?: number;
};

export const name = "@noirhare/dsh-web-search-tavily";

export const inject = ["settings", "web"];

export const Config: z<Config> = z.object({
    url: z.string().default(TAILY_DEFAULT_URL),
    token: z.string().min(2),
    keyless: z.boolean().default(false),

    searchDepth: z.union(["basic", "advanced", "fast", "ultra-fast"] as const),
    chunksPerSource: z.number().min(1).max(3),
});

export const apply = (ctx: Context, config: Config) => {
    const settings = ctx.settings.register("noirhare-web-search-tavily", Config, {
        base: {
            ...config,
            token: config.token ?? launchEnvironmentOf(ctx).get("TAVILY_API_KEY")?.value,
        },
    });

    ctx.web.registerSearchProvider(new TavilyWebSearchProvider(settings));
};
