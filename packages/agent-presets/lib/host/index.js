import { AgentPresets, discoverPresets } from "@deepseek-ai/dsh-agent-presets";
import Path from "node:path";
import FS from "node:fs";
export default class NRAgentPresets extends AgentPresets {
  extraRoots = /* @__PURE__ */ new Map();
  registerRoot(id, dir) {
    const path = Path.resolve(dir);
    try {
      if (!FS.statSync(path).isDirectory()) throw new Error(`root "${id}" is not a directory: ${path}`);
    } catch (e) {
      throw new Error(`root "${id}": path not accessible: ${path}`, { cause: e });
    }
    if (this.extraRoots.has(id)) throw new Error(`duplicate root id: ${id}`);
    this.extraRoots.set(id, path);
    return () => {
      this.extraRoots.delete(id);
    };
  }
  async list() {
    const base = await super.list();
    if (this.extraRoots.size === 0) return base;
    const seen = new Set(base.map((preset) => preset.id));
    const extra = await discoverPresets(
      [...new Set(this.extraRoots.values())].map((root) => ({ path: root, trust: "system" }))
    );
    return [...base, ...extra.filter((preset) => !seen.has(preset.id))];
  }
}
