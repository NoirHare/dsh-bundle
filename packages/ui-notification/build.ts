import { build } from "esbuild";

import FS from "node:fs";

import client from "@noirhare/dsh-client-plugin";

{ const result = await build({
    entryPoints: ["src/host/index.ts"],
    outdir: "lib/host",
    outbase: "src/host",
    packages: "external",
    write: true,
    tsconfig: "tsconfig.host.json",
    sourcemap: "inline",
});
if (result.errors) {
    for (const error of result.errors) {
        console.log(error);
    }
} }

{ const clientEntries = [
    "src/client/index.ts",
];
const result = await build({
    entryPoints: clientEntries.filter((e) => FS.existsSync(e)),
    outdir: "lib/client",
    outbase: "src/client",
    bundle: true,
    format: "cjs",
    packages: "bundle",
    external: ["react", "@deepseek-ai/dsh-client-ui-primitives"],
    write: true,
    tsconfig: "tsconfig.client.json",
    plugins: [client("@noirhare/dsh-ui-notification")],
    sourcemap: "inline",
});
if (result.errors) {
    for (const error of result.errors) {
        console.log(error);
    }
} }
