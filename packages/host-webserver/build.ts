import { build } from "esbuild";

import FS from "node:fs";

{ const hostEntries = [
    "src/host/index.ts",
    "src/host/invariant.ts",
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
