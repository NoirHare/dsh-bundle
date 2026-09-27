import koffi from "koffi";

let list;
if (process.platform === "win32") {
    const kernel32 = koffi.load("kernel32.dll");
    const GetLogicalDrives = kernel32.func("uint32 __stdcall GetLogicalDrives()");

    list = () => {
        const mask: number = GetLogicalDrives();

        const result = [];
        for (let i = 0; i < 26; i++) {
            if (mask & (1 << i)) result.push(String.fromCharCode(65 + i));
        }
        return result;
    };
} else {
    list = () => {
        throw new Error("platform not supported.");
    };
}

export default { list };
