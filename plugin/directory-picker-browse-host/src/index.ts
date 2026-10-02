import type { Context, Volatile } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import type {
    DirectoryEntry,
    DirectoryListing,
    DirectoryPickerBrowseCapability,
    DirectoryPickerCapability,
} from "@deepseek-ai/dsh-host-directory-picker";
import DirectoryPicker, { DirectoryPickerError } from "@deepseek-ai/dsh-host-directory-picker";

import Path from "node:path";
import FS from "node:fs/promises";
import OS from "node:os";

import drive from "./drive";
import abortable from "./abortable";

const isFullyQualifiedPath = (path: string, platform: NodeJS.Platform = process.platform): boolean => {
    return platform === "win32"
        ? Path.win32.isAbsolute(path) && /^(?:[A-Za-z]:[\\/]|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)/.test(path)
        : Path.posix.isAbsolute(path);
};

export default class BrowseDirectoryPicker extends DirectoryPicker implements DirectoryPickerBrowseCapability {
    static inject: string[] = [];

    static Config = z.object({
        home: z.string().default(OS.homedir()).volatile(),
    });

    kind: "browse" = "browse";

    constructor(
        ctx: Context,
        readonly config: ReturnType<typeof BrowseDirectoryPicker.Config>,
    ) {
        super(ctx);

        if (!isFullyQualifiedPath(config.home.get())) throw new Error("home must be a fully qualified path");
    }

    capability(): DirectoryPickerCapability {
        return this;
    }

    async list(path?: string, signal?: AbortSignal): Promise<DirectoryListing> {
        const home = this.config.home.get();
        if (!isFullyQualifiedPath(home)) throw new Error("home must be a fully qualified path");

        if (process.platform === "win32" && (path === undefined || path === "/")) {
            return {
                path: "/",
                home,
                crumbs: [{ name: "/", path: "/", hidden: false }],
                entries: drive.list().map((d) => ({ name: `${d}:/`, path: `${d}:/`, hidden: false })),
                truncated: false,
            };
        }

        if (path !== undefined && !isFullyQualifiedPath(path)) {
            throw new DirectoryPickerError("directory-unreadable", path, `cannot list "${path}": not a fully qualified path`);
        }
        const target = Path.resolve(path ?? "/");

        try {
            return {
                path: target,
                home: home,
                crumbs: this.crumbs(target),
                entries: await this.subdir(target, signal),
                truncated: false,
            };
        } catch (e) {
            signal?.throwIfAborted();
            throw new DirectoryPickerError(
                "directory-unreadable",
                target,
                `cannot list ${target}: ${e instanceof Error ? e.message : String(e)}`,
            );
        }
    }

    private crumbs(path: string): DirectoryEntry[] {
        const chain = [];
        for (let current = path; ; ) {
            chain.push(current);

            const parent = Path.dirname(current);
            if (parent === current) break;
            current = parent;
        }

        return chain.reverse().map((p, i) => ({
            name: i === 0 ? p : Path.basename(p),
            path: p,
            hidden: false,
        }));
    }

    private async subdir(path: string, signal?: AbortSignal): Promise<DirectoryEntry[]> {
        const dir = await abortable(FS.opendir(path), signal, (p) =>
            p.then(
                (d) => d.close().catch(() => {}),
                () => {},
            ),
        );

        const result: DirectoryEntry[] = [];
        try {
            while (true) {
                const dirent = await abortable(dir.read(), signal);
                if (dirent === null) break;

                let isDirectory = dirent.isDirectory();

                if (!isDirectory && dirent.isSymbolicLink()) {
                    const target = Path.join(path, dirent.name);
                    try {
                        isDirectory = (await abortable(FS.stat(target), signal)).isDirectory();
                    } catch (e) {
                        if (signal?.aborted) throw signal.reason;
                    }
                }

                if (isDirectory) {
                    result.push({ name: dirent.name, path: Path.join(path, dirent.name), hidden: dirent.name.startsWith(".") });
                }
            }
        } finally {
            await abortable(dir.close(), signal);
        }

        return result.sort((l, r) => (l.name < r.name ? -1 : l.name === r.name ? 0 : 1));
    }

    async createDirectory(path: string, name: string): Promise<string> {
        if (!isFullyQualifiedPath(path)) {
            throw new DirectoryPickerError(
                "directory-create-failed",
                path,
                `cannot create under "${path}": not a fully qualified parent path`,
            );
        }
        const parent = Path.resolve(path);
        if (name.trim() === "" || name === "." || name === ".." || /[/\\]/.test(name)) {
            throw new DirectoryPickerError("directory-create-failed", Path.join(parent, name), `"${name}" is not a single path segment`);
        }
        const target = Path.join(parent, name);
        try {
            await FS.mkdir(target);
            return target;
        } catch (e: unknown) {
            if (typeof e === "object" && e !== null && "code" in e && e.code === "EEXIST") {
                throw new DirectoryPickerError("directory-exists", target, `${target} already exists`);
            }
            throw new DirectoryPickerError(
                "directory-create-failed",
                target,
                `cannot create ${target}: ${e instanceof Error ? e.message : String(e)}`,
            );
        }
    }
}
