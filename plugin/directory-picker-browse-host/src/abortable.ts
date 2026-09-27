export default <T>(promise: Promise<T>, signal?: AbortSignal, onDiscarded?: (promise: Promise<T>) => void): Promise<T> => {
    if (signal === undefined) return promise;

    const { promise: result, resolve, reject } = Promise.withResolvers<T>();

    const onAbort = () => {
        signal.removeEventListener("abort", onAbort);
        reject(signal.reason);
    };

    promise.then(
        (v) => {
            signal.removeEventListener("abort", onAbort);
            if (signal.aborted) return onDiscarded?.(promise);
            resolve(v);
        },
        (r) => {
            signal.removeEventListener("abort", onAbort);
            if (signal.aborted) return onDiscarded?.(promise);
            reject(r);
        },
    );

    if (signal.aborted) {
        reject(signal.reason);
        return result;
    }
    signal.addEventListener("abort", onAbort);

    return result;
};
