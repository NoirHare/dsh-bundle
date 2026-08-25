import { defineConfig } from "tsdown";

export default defineConfig({
    root: "src",
    entry: ["src/{index,invariant,startup}.ts"],
    copy: ["agent-presets"],
    outDir: "lib",
    format: "esm",
    target: "es2024",
    fixedExtension: false,
    exports: true,
});