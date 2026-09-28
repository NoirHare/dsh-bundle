import { useState } from "react";
import { Button } from "@deepseek-ai/dsh-client-ui-primitives";
import type { PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";

import style from "./NotificationPermissionSetting.module.css";

export default ({ t }: PropsLocale<typeof import(".").name>) => {
    const [permission, setPermission] = useState(Notification.permission);

    return (
        <div className={style.row}>
            <div className={style.rowText}>
                <div className={style.title}>{t("permission.label")}</div>
            </div>
            <Button
                variant="outline"
                disabled={permission !== "default"}
                onClick={() => Notification.requestPermission().then((next) => setPermission(next))}
            >
                {t(`permission.${permission}`)}
            </Button>
        </div>
    );
};
