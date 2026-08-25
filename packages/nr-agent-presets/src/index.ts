import { Context } from "@deepseek-ai/cordis";
import NRAgentPresets from "@noirhare/dsh-agent-presets";
import Path from "node:path";

export const inject = [NRAgentPresets.name];

export function apply(ctx: Context) {
    (ctx.agentPresets as NRAgentPresets).registerRoot(Path.resolve(import.meta.dirname, "agent-presets"));
}