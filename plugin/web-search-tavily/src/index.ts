import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-settings";
import type {} from "@deepseek-ai/dsh-web";

import z from "@deepseek-ai/schemastery";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { TAILY_DEFAULT_URL, TavilyWebSearchProvider } from "./provider";

export const name = "@noirhare/dsh-web-search-tavily";

export const inject = ["settings", "web"];

export const Config = z.object({
    url: z.string().volatile().default(TAILY_DEFAULT_URL),
    token: z.string().volatile().min(2),
    keyless: z.boolean().volatile().default(false),

    searchDepth: z.union(["basic", "advanced", "fast", "ultra-fast"] as const).volatile(),
    chunksPerSource: z.number().volatile().min(1).max(3),
});

export const apply = (ctx: Context, config: ReturnType<typeof Config>) => {
    ctx.web.registerSearchProvider(
        new TavilyWebSearchProvider({
            ...config,
            token: {
                get: () => config.token.get() ?? launchEnvironmentOf(ctx).get("TAVILY_API_KEY")?.value,
            },
        }),
    );
};
