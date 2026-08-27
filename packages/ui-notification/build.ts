import { build } from "esbuild";

import FS from "node:fs";

import client from "@noirhare/dsh-client-plugin";

{ const hostEntries = [
    "src/host/index.ts",
];
const result = await build({
    entryPoints: hostEntries.filter((e) => FS.existsSync(e)),
    outdir: "lib/host",
    outbase: "src/host",
    packages: "external",
    write: true,
    tsconfig: "tsconfig.host.json",
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
});
if (result.errors) {
    for (const error of result.errors) {
        console.log(error);
    }
} }
