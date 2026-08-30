import { build } from "esbuild";

const result = await build({
    entryPoints: ["src/host/index.ts"],
    outdir: "lib/host",
    outbase: "src/host",
    packages: "external",
    platform: "node",
    format: "esm",
    bundle: true,
    write: true,
    tsconfig: "tsconfig.host.json",
    sourcemap: "inline",
});
if (result.errors) {
    for (const error of result.errors) {
        console.log(error);
    }
}
