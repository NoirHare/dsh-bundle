import type { Context } from "@deepseek-ai/cordis";
import type { PresetRoot } from "@deepseek-ai/dsh-agent-presets";

import Path from "node:path";

declare module "@deepseek-ai/cordis" {
    interface Context {
        agentPresetsRoots?: string[];
    }
}

const root = Path.resolve(import.meta.dirname, "..", "agent-presets");

export const name = "@noirhare/dsh-agent-presets-roots";

export const inject = [];

export function apply(ctx: Context) {
    ctx.provide("agentPresetsRoots", [{ path: root, trust: "system" }] satisfies PresetRoot[]);
}
