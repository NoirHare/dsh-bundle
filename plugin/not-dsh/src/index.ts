import type { Context } from "@deepseek-ai/cordis";

import type {} from "@deepseek-ai/dsh-system-prompt";
import type {} from "@deepseek-ai/dsh-agent";

const SECTION_NAME = "context:file-reference";
export const FILE_REFERENCE_PROMPT =
    "Tokens prefixed with @ are paths the user explicitly referenced. Relative paths resolve from the workspace base; absolute paths identify files or directories on the host. A trailing slash marks a directory: list it when its contents matter. Anything else is a file: use the read tool when its contents are needed, and do not claim to have inspected it before reading. @\"...\" quotes a path containing spaces.";

export const name = "@noirhare/dsh-not-dsh";

export const inject = [];

export const apply = (ctx: Context) => {
    ctx.on("system-prompt/assemble", async (assembly, assemblyContext, next) => {
        const out = await next();

        const sections = out.sections.map(s => {
            if (s.name !== SECTION_NAME) return s;
            if (s.text.length === 0) return s;

            return { ...s, text: FILE_REFERENCE_PROMPT, interpolate: s.interpolate };
        });

        return { ...out, sections };
    });
};
