import z from "@deepseek-ai/schemastery";
import { Context } from "@deepseek-ai/cordis";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";

import { TAILY_DEFAULT_URL, TailyWebSearchProvider } from "./provider";

export type Config = {
    url: string
    token?: string
    keyless: boolean

    searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast"
    chunksPerSource?: number
};

export const name = "@noirhare/web-search-tavily";
export const inject = ["settings", "web"];
export const Config: z<Config> = z.object({
    url: z.string().default(TAILY_DEFAULT_URL),
    token: z.string().min(2),
    keyless: z.boolean().default(false),

    searchDepth: z.union(["basic", "advanced", "fast", "ultra-fast"] as const),
    chunksPerSource: z.number().min(1).max(3),
});

export const apply = (ctx: Context, config: Config) => {
    const settings = ctx.settings.register(settingsNamespace(name), Config, {
        base: {
            ...config,
            token: config.token ?? launchEnvironmentOf(ctx).get("TAVILY_API_KEY")?.value,
        },
    });

    ctx.web.registerSearchProvider(new TailyWebSearchProvider(settings));
};
