import { useEffect, useRef, useState } from "react";

type Fetcher<D extends unknown[], R> = (...args: [...D, AbortSignal]) => Promise<R>;

export default <D extends unknown[], R>(fetcher: Fetcher<D, R>, deps: [...D]): [R | null, unknown | null, boolean] => {
    const [r, setR] = useState<R | null>(null);
    const [error, setError] = useState<unknown | null>(null);
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);

        fetcher(...deps, controller.signal).then(
            (value) => {
                if (controller.signal.aborted) return;
                setR(value);
                setError(null);
                setLoading(false);
            },
            (reason) => {
                if (controller.signal.aborted) return;
                setR(null);
                setError(reason);
                setLoading(false);
            },
        );

        return () => controller.abort();
    }, deps);

    return [r, error, isLoading];
};
