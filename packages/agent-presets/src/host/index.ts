import { Context } from "@deepseek-ai/cordis";
import { AgentPreset, AgentPresets, Config, PresetRoot, discoverPresets } from "@deepseek-ai/dsh-agent-presets";

import Path from "node:path";
import FS from "node:fs";

export default class NRAgentPresets extends AgentPresets {
    readonly extraRoots = new Map<string, string>();

    private readonly harnessBase_: string;

    constructor(ctx: Context, config: Config) {
        super(ctx, config);

        const { baseUrl } = ctx;
        if (baseUrl === undefined) {
            throw new Error(
                "@noirhare/dsh-agent-presets: the roster needs `ctx.baseUrl` to resolve the plugins a composition names; " +
                    "compose it under a Loader, or set the base on the context this plugin is applied to",
            );
        }
        this.harnessBase_ = baseUrl;
    }

    registerRoot(id: string, dir: string): () => void {
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

    override get roots(): readonly PresetRoot[] {
        if (this.extraRoots.size === 0) return super.roots;
        return [...super.roots, ...[...new Set(this.extraRoots.values())].map((path) => ({ path, trust: "system" }) satisfies PresetRoot)];
    }

    override async list(): Promise<AgentPreset[]> {
        const base = await super.list();
        if (this.extraRoots.size === 0) return base;

        const seen = new Set(base.map((preset) => preset.id));
        const extra = await discoverPresets(
            [...new Set(this.extraRoots.values())].map((root) => ({ path: root, trust: "system" }) satisfies PresetRoot),
            this.harnessBase_,
        );
        return [...base, ...extra.filter((preset) => !seen.has(preset.id))];
    }
}
