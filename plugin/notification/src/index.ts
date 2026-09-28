import type { Context } from "@deepseek-ai/cordis";

import type { SessionId } from "@deepseek-ai/dsh-api-remotes/client";
import type {} from "@deepseek-ai/dsh-api-session-controller/client";
import type {} from "@deepseek-ai/dsh-client-locale/client";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
import type {} from "@deepseek-ai/dsh-client-ui-workspace/client";
import type {} from "@deepseek-ai/dsh-client-ui-session/client";

import { type LocaleKeys, en, zh } from "./locales";

import NotificationPermissionSetting from "./NotificationPermissionSetting";

declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface LocaleNamespaceMap {
        [name]: LocaleKeys;
    }
}

const notify = (title: string, body: string, ctx: Context, id: SessionId) => {
    if (Notification.permission !== "granted") return;
    if (document.hasFocus()) return;

    const notification = new Notification(title, { body });
    notification.addEventListener("click", () => {
        ctx.uiWorkspace.openSession(id);
        window.focus();
    });
};

export const name = "@noirhare/dsh-ui-notification";

export const inject = ["locale", "slots", "remote", "sessions", "uiWorkspace", "uiSession"];

export const apply = (ctx: Context) => {
    ctx.effect(() => ctx.locale.register(name, { zh, en }), `${name}: locale`);
    const t = ctx.locale.bind(name);

    ctx.slots.inject("settings.general.item", () => {
        return ctx.slots.register({ name: "settings.general.item", id: name, locale: name }, NotificationPermissionSetting);
    });

    ctx.effect(() => {
        return ctx.remote.$on("api-session/status", (id, running) => {
            if (running) return;

            const summary = ctx.sessions.list.getSnapshot().byId[id];
            if (summary?.origin) return;

            notify(t("finished.title"), summary?.displayTitle ?? id, ctx, id);
        });
    }, `${name}: finished`);

    ctx.effect(() => {
        let previous = [...ctx.uiSession.sessionStatus.getSnapshot()].filter(([, status]) => status.pendingInteraction).map(([id]) => id);
        return ctx.uiSession.sessionStatus.subscribe(() => {
            const current = [...ctx.uiSession.sessionStatus.getSnapshot()]
                .filter(([, status]) => status.pendingInteraction)
                .map(([id]) => id);
            for (const id of current) {
                if (previous.includes(id)) continue;

                const summary = ctx.sessions.list.getSnapshot().byId[id];
                if (summary?.origin) continue;

                notify(t("waiting.title"), summary?.displayTitle ?? id, ctx, id);
            }
            previous = current;
        });
    }, `${name}: waiting`);
};
