import type { Context } from "@deepseek-ai/cordis";

import type {} from "@deepseek-ai/dsh-client-locale/client";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";

import type { LocaleKeys } from "./locale";
import { zh, en } from "./locale";

import type { DirectoryPickerExtraProps } from "./DirectoryPicker";
import DirectoryPicker from "./DirectoryPicker";

declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface LocaleNamespaceMap {
        [name]: LocaleKeys;
    }
}

export const name = "@noirhare/dsh-client-ui-directory-picker-browse";

export const inject = ["locale", "slots", "uiWorkspace"];

export const apply = (ctx: Context) => {
    ctx.effect(() => ctx.locale.register(name, { zh, en }), `${name}: locale`);

    const directoryPickerInject = (): DirectoryPickerExtraProps => ({
        list: (path?: string, signal?: AbortSignal) => ctx.uiWorkspace.listDirectory(path, signal),
        create: (path: string, name: string) => ctx.uiWorkspace.createDirectory(path, name),
    });

    ctx.slots.inject("conversation.hero.workspace.directoryFlow", () => {
        return ctx.slots.register(
            { name: "conversation.hero.workspace.directoryFlow", inject: directoryPickerInject, locale: name },
            DirectoryPicker,
        );
    });
    ctx.slots.inject("sidebar.workspaces.directoryFlow", () => {
        return ctx.slots.register(
            { name: "sidebar.workspaces.directoryFlow", inject: directoryPickerInject, locale: name },
            DirectoryPicker,
        );
    });
};
