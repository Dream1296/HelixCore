import crypto from "crypto";

export function getBufferMd5(buffer: Buffer): string {
    return crypto
        .createHash("md5")
        .update(buffer)
        .digest("hex");
}