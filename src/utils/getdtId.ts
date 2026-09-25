const BASE62_CHARS =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const EPOCH = Math.floor(
    new Date("2026-09-25T00:00:00+08:00").getTime() / 1000
);

function toBase62(value: number): string {
    if (value === 0) {
        return "0";
    }

    let result = "";

    while (value > 0) {
        const remainder = value % 62;
        result = BASE62_CHARS[remainder] + result;
        value = Math.floor(value / 62);
    }

    return result;
}

const OFFSET_BASE62 = fromBase62("2035");

/**
 * 将 Base62 字符串转换为十进制整数
 */
function fromBase62(value: string): number {
    let result = 0;

    for (const char of value) {
        const index = BASE62_CHARS.indexOf(char);

        if (index === -1) {
            throw new Error(`非法的 Base62 字符: ${char}`);
        }

        result = result * 62 + index;
    }

    return result;
}

/**
 * 生成动态id
 */
export function getDtId(): string {
    const now = Math.floor(Date.now() / 1000);

    const offset = now - EPOCH;

    const value = offset + OFFSET_BASE62;

    return toBase62(value);
}

