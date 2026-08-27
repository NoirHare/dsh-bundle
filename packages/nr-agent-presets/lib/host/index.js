import Path from "node:path";
const id = "dsh-nr-agent-presets";
const root = Path.resolve(import.meta.dirname, "..", "..", "agent-presets");
export const inject = ["agentPresets"];
export function apply(ctx) {
  ctx.effect(() => ctx.agentPresets.registerRoot(id, root), `${id}:root`);
}
