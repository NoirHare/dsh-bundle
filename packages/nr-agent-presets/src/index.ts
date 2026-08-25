import { Context } from "@deepseek-ai/cordis";
import NRAgentPresets from "@noirhare/dsh-agent-presets";
import Path from "node:path";

const id = "dsh-nr-agent-presets";
const root = Path.resolve(import.meta.dirname, "agent-presets");

export const inject = ["agentPresets"];

export function apply(ctx: Context) {
    ctx.effect(() => (ctx.agentPresets as NRAgentPresets).registerRoot(id, root), `${id}:root`);
}