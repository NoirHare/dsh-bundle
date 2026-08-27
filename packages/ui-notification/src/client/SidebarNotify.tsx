import React, { MouseEvent, useMemo, useState } from "react";
import type {} from "@deepseek-ai/dsh-client-ui-sidebar/client";
import { Button } from "@deepseek-ai/dsh-client-ui-primitives";

export function SidebarNotify() {
    const [permission, setPermission] = useState(Notification.permission);

    function buttonClick(event: MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        Notification.requestPermission((permission) => setPermission(permission));
    }

    return useMemo(() => permission === "default" ? <Button variant="toolbar" onClick={buttonClick}>启动通知</Button> : null, [permission]);
}

export default SidebarNotify;
