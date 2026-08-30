import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";

import SidebarNotify from "./SidebarNotify";

const ID = "@noirhare/dsh-ui-notification";

export const inject = ["slots", "sessions"];

export async function apply(ctx: ClientContext) {
    if (Notification.permission === "default") {
        ctx.slots.inject(
            "sidebar.footer.action",
            () => ctx.slots.register({
                name: "sidebar.footer.action",
                id: `${ID}:request-permission`,
            }, SidebarNotify),
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
                            // n.close();
                        });
                    }

                    // pending
                    if (p.pendingInteraction !== c.pendingInteraction && c.pendingInteraction && !document.hasFocus()) {
                        const n = new Notification(c.displayTitle, { body: `${c.pendingInteraction} 等待响应` });
                        n.addEventListener("click", (e) => {
                            e.preventDefault();
                            ctx.sessions.open(id);
                            window.focus();
                            // n.close();
                        });
                    }
                }
            } finally {
                previous = snapshot.byId;
            }
        });
    }, `${ID}:session-update`);
}
