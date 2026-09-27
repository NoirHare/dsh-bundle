import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

export default <T>(
    initial: T | (() => T),
    limit: number = 100,
): [T, Dispatch<SetStateAction<T>>, undo: () => void, redo: () => void, canUndo: boolean, canRedo: boolean] => {
    const [history, setHistory] = useState<T[]>([typeof initial === "function" ? (initial as () => T)() : initial]);
    const [index, setIndex] = useState(0);

    const set: Dispatch<SetStateAction<T>> = useCallback(
        (action) => {
            const current = history[index];
            const next = typeof action === "function" ? (action as (p: T) => T)(current) : action;
            if (Object.is(next, current)) return;

            let stack = [...history.slice(0, index + 1), next]; // 砍掉 redo 分支
            let i = index + 1;
            if (stack.length > limit) {
                const drop = stack.length - limit;
                stack = stack.slice(drop);
                i -= drop;
            }
            setHistory(stack);
            setIndex(i);
        },
        [history, index, limit],
    );

    const undo = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
    const redo = useCallback(() => setIndex((i) => Math.min(history.length - 1, i + 1)), [history.length]);

    return [history[index], set, undo, redo, index > 0, index < history.length - 1];
};
