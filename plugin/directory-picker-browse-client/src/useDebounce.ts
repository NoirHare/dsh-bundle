import { useEffect, useState } from "react";

export default <T>(value: T, delay: number) => {
    const [result, setResult] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setResult(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return result;
};
