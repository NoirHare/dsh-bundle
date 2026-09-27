import type { TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import type { DirectoryFlowOwnerProps } from "@deepseek-ai/dsh-client-ui-workspace/client";
import type { DirectoryListing } from "@deepseek-ai/dsh-api-remotes/client";

import { useEffect, useRef, useState } from "react";
import useUndoable from "./useUndoable";
import useResource from "./useResource";
import useDebounce from "./useDebounce";

import { Button, Input, Modal } from "@deepseek-ai/dsh-client-ui-primitives";

import clsx from "clsx";

import styles from "./DirectoryPicker.module.css";

export type DirectoryPickerExtraProps = {
    list: (path?: string, signal?: AbortSignal) => Promise<DirectoryListing>;
    create: (path: string, name: string) => Promise<string>;
};

type CreateModalProps = {
    className?: string;
    open: boolean;
    onClose: () => void;

    busy: boolean;

    t: TranslateNS<typeof import("./index").name>;

    onSubmit: (name: string) => void;
};

const CreateModal = ({ className, open, onClose, busy, t, onSubmit }: CreateModalProps) => {
    const [name, setName] = useState("");

    return (
        <Modal className={className} open={open} onClose={onClose} title={t("picker.create_input.title")} headless>
            <div>{t("picker.create_input.title")}</div>
            <Input
                type="text"
                placeholder={t("picker.create_input.placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
            />
            <Button
                variant="primary"
                disabled={busy}
                onClick={() => {
                    try {
                        onSubmit(name);
                    } catch (error) {}
                }}
            >
                {t("picker.select")}
            </Button>
        </Modal>
    );
};

/* prettier-ignore */
type DirectoryPickerProps =
    { t: TranslateNS<typeof import("./index").name> }
    & DirectoryFlowOwnerProps
    & DirectoryPickerExtraProps;

export default ({ t, open, busy, onPicked, onCancel, onError, list, create }: DirectoryPickerProps) => {
    const [path, setPath, undoPath] = useUndoable("/", 2);
    const [dir, dirError, isDirLoading_] = useResource(list, [path]);
    const [regex, setRegex] = useState<RegExp | null>(new RegExp("", "iv"));
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const home = dir?.home;
    const crumbs = dir?.crumbs.filter((c) => c.path !== "/");
    const subdirs = dir?.entries.filter((d) => regex?.test(d.name) ?? false);
    const isDirLoading = useDebounce(isDirLoading_, 50);

    const crumbsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dirError) return;
        onError(dirError instanceof Error ? dirError.message : String(dirError));
        undoPath();
    }, [dirError]);

    useEffect(() => {
        crumbsRef.current?.scrollTo({ left: crumbsRef.current.scrollWidth, behavior: "smooth" });
    }, [crumbs]);

    if (!open) return;

    return (
        <Modal className={styles.root} open onClose={onCancel} title={t("picker.title")} headless>
            <div>{t("picker.title")}</div>
            {!crumbs && isDirLoading ? (
                <div className={styles.loading}>{t("picker.loading")}</div>
            ) : (
                <>
                    <div className={styles.nav}>
                        {home && (
                            <button className={styles.nav_home} onClick={() => setPath(home)}>
                                home
                            </button>
                        )}
                        <button className={styles.nav_root} onClick={() => setPath("/")}>
                            /
                        </button>
                        <div ref={crumbsRef} className={styles.nav_crumbs}>
                            {crumbs &&
                                crumbs.map((c, i) => (
                                    <>
                                        {i !== 0 && " > "}
                                        <button onClick={() => setPath(c.path)}>{c.name}</button>
                                    </>
                                ))}
                        </div>
                        <input
                            className={clsx(styles.nav_search, !regex && styles.nav_search_error)}
                            placeholder={t("picker.regexp_placeholder")}
                            onChange={(e) => {
                                try {
                                    setRegex(new RegExp(e.target.value, "iv"));
                                } catch {
                                    setRegex(null);
                                }
                            }}
                        />
                    </div>
                    <div className={styles.subdirs}>
                        {!subdirs || isDirLoading ? (
                            <div className={styles.loading}>{t("picker.loading")}</div>
                        ) : (
                            subdirs.map((d) => (
                                <button className={styles.subdirs_dir} onClick={() => setPath(d.path)}>
                                    {d.name}
                                </button>
                            ))
                        )}
                    </div>
                    <div className={styles.actions}>
                        <Button variant="toolbar" disabled={busy || isDirLoading} onClick={() => setIsCreateOpen(true)}>
                            {t("picker.create")}
                        </Button>
                        <Button variant="primary" disabled={busy || isDirLoading} onClick={() => onPicked(path)}>
                            {t("picker.select")}
                        </Button>
                    </div>
                </>
            )}
            {isCreateOpen && (
                <CreateModal
                    className={styles.create_input_root}
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    busy={busy || isDirLoading}
                    t={t}
                    onSubmit={(name) =>
                        create(path, name).then(
                            (v) => {
                                setIsCreateOpen(false);
                                setPath(v);
                            },
                            (reason) => {
                                setIsCreateOpen(false);
                                onError(reason instanceof Error ? reason.message : String(reason));
                            },
                        )
                    }
                />
            )}
        </Modal>
    );
};
