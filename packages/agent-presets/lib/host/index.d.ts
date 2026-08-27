import { AgentPreset, AgentPresets } from "@deepseek-ai/dsh-agent-presets";
export default class NRAgentPresets extends AgentPresets {
    readonly extraRoots: Map<string, string>;
    registerRoot(id: string, dir: string): () => void;
    list(): Promise<AgentPreset[]>;
}
