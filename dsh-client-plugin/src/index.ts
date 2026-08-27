import type { Plugin } from "esbuild";

export default function client(id: string): Plugin {
    return {
        name: "dsh-client",
        setup(build) {
            build.initialOptions.banner = {
                js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {\nvar module = { exports: {} };`,
            };
            build.initialOptions.footer = {
                js: "return module.exports; } });",
            };
        },
    };
}
