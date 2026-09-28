export const zh = {
    "permission.label": "通知",
    "permission.default": "允许通知",
    "permission.granted": "已允许",
    "permission.denied": "已阻止",
    "finished.title": "任务结束",
    "waiting.title": "等待你的响应",
};

export const en: Record<LocaleKeys, string> = {
    "permission.label": "Notifications",
    "permission.default": "Allow notifications",
    "permission.granted": "Allowed",
    "permission.denied": "Blocked",
    "finished.title": "Task finished",
    "waiting.title": "Needs your response",
};

export type LocaleKeys = keyof typeof zh;
