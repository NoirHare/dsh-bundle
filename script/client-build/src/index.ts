import path from "node:path";
import FS from "node:fs/promises";

import { build } from "esbuild";

import * as lightningcss from "lightningcss";

const pkgPath = path.resolve(process.cwd(), "package.json");
const pkg = JSON.parse(await FS.readFile(pkgPath, "utf8"));

await build({
    entryPoints: {
        host: "virtual:host-entry",
        client: "src/index.ts",
    },

    bundle: true,
    platform: "browser",
    banner: { js: `window.__ModuleLoader__.load({id:"${pkg.name}",factory:function(require){var module={exports:{}};` },
    footer: { js: `return module.exports;}});` },
    format: "cjs",
    outbase: "src",
    outdir: "lib",
    write: true,
    external: Object.keys(pkg.peerDependencies),
    sourcemap: "inline",
    logLevel: "info",

    plugins: [
        {
            name: "host-export",
            setup(build) {
                build.onResolve({ filter: /^virtual:host-entry$/ }, () => ({
                    path: path.join(process.cwd(), "host.js"),
                    namespace: "host-entry",
                }));
                build.onLoad({ filter: /.*/, namespace: "host-entry" }, () => ({
                    contents: `export const name = "${pkg.name}"; export const apply = () => {};`,
                    loader: "copy",
                }));
            },
        },
        {
            name: "dsh-css-modules",
            setup(build) {
                build.onResolve({ filter: /\.module\.css$/ }, (args) => {
                    const abs = path.isAbsolute(args.path) ? args.path : path.resolve(path.dirname(args.importer), args.path);
                    return { path: abs, namespace: "dsh-css-module" };
                });
                build.onLoad({ filter: /.*/, namespace: "dsh-css-module" }, async (args) => {
                    const source = await FS.readFile(args.path);
                    const { code, exports } = lightningcss.transform({
                        filename: args.path,
                        code: source,
                        cssModules: { pattern: "[hash]_[local]" },
                        minify: true,
                    });

                    const classes: { [clazz: string]: string } = {};
                    for (const [clazz, entry] of Object.entries(exports ?? {})) {
                        classes[clazz] = entry.name;
                    }

                    const id = `${pkg.name}/${path.basename(args.path)}`;
                    const content = [
                        `const css = ${JSON.stringify(code.toString())};`,
                        `const id = ${JSON.stringify(id)};`,
                        `if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(id) + "]") === null) {`,
                        `    const element = document.createElement("style");`,
                        `    element.dataset.plugin = ${JSON.stringify(pkg.name)};`,
                        `    element.dataset.pluginCss = id;`,
                        `    element.textContent = css;`,
                        `    document.head.appendChild(element);`,
                        `}`,
                        `export default ${JSON.stringify(classes)};`,
                    ].join("\n");

                    return { contents: content, loader: "js" };
                });
            },
        },
    ],
});
