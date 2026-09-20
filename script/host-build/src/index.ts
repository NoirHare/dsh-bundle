import Path from "node:path";

import { build } from "esbuild";

await build({
    entryPoints: {
        host: "src/index.ts",
    },

    bundle: true,
    platform: "node",
    format: "esm",
    outbase: "src",
    outdir: "lib",
    write: true,
    packages: "external",
    sourcemap: "inline",
    logLevel: "info",
});
