import { AgentPreset, AgentPresets, PresetRoot, discoverPresets } from "@deepseek-ai/dsh-agent-presets";

export default class NRAgentPresets extends AgentPresets {
    private extraRoots = new Set<string>();

    registerRoot(path: string): void {
        this.extraRoots.add(path);
    }

    unregisterRoot(path: string): void {
        this.extraRoots.delete(path);
    }

    override async list(): Promise<AgentPreset[]> {
        const base = await super.list();
        if (this.extraRoots.size === 0) return base;

        const seen = new Set(base.map((preset) => preset.id));
        const extra = await discoverPresets(
            [...this.extraRoots].map((path) => ({ path, trust: "system" }) satisfies PresetRoot),
        );
        return [...base, ...extra.filter((preset) => !seen.has(preset.id))];
    }
}