import type { Context } from "@deepseek-ai/cordis";

import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
import type {} from "@deepseek-ai/dsh-client-ui-sidebar/client";

import type {} from "@deepseek-ai/dsh-api-session-controller/client";
import type {} from "@deepseek-ai/dsh-client-ui-session/client";

import itiriri from "itiriri";
import SidebarNotify from "./SidebarNotify";

const ID = "@noirhare/dsh-ui-notification";

export const inject = ["slots", "sessions", "uiSession"];

export async function apply(ctx: Context) {
    if (Notification.permission === "default") {
        ctx.slots.inject("sidebar.footer.action", () =>
            ctx.slots.register(
                {
                    name: "sidebar.footer.action",
                    id: `${ID}:request-permission`,
                },
                SidebarNotify,
            ),
        );
    }

    ctx.effect(() => {
        let previous = ctx.sessions.list.getSnapshot().byId;
        return ctx.sessions.list.subscribe(() => {
            const snapshot = ctx.sessions.list.getSnapshot();
            try {
                if (Notification.permission !== "granted") return;

                for (const id of snapshot.ids) {
                    const p = previous[id];
                    if (!p) continue;

                    const c = snapshot.byId[id];

                    // turn end
                    if (!c.origin && p.running && !c.running && !document.hasFocus()) {
                        const n = new Notification(c.displayTitle, { body: "运行结束" });
                        n.addEventListener("click", (e) => {
                            e.preventDefault();
                            ctx.sessions.open(id);
                            window.focus();
                        });
                    }
                }
            } finally {
                previous = snapshot.byId;
            }
        });
    }, `${ID}:sessions-update`);

    ctx.effect(() => {
        let previous = ctx.uiSession.pendingInteractions.getSnapshot().keys();
        return ctx.uiSession.pendingInteractions.subscribe(() => {
            const sessions = ctx.sessions.list.getSnapshot().byId;
            const ids = itiriri(ctx.uiSession.pendingInteractions.getSnapshot().keys()).exclude(previous);

            for (const id of ids) {
                if (Notification.permission !== "granted") return;

                const c = sessions[id];

                const n = new Notification(c.displayTitle, { body: `等待响应` });
                n.addEventListener("click", (e) => {
                    e.preventDefault();
                    ctx.sessions.open(id);
                    window.focus();
                });
            }
        });
    }, `${ID}:interactions-update`);
}
