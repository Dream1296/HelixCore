import crypto from 'crypto';

// 128位密钥（16字节）
const KEY = Buffer.from('~0Wn75L0->;$8Xa9'); // 示例，请替换成安全随机生成的

/**
 * 加密
 * @param {Buffer|string} data - 明文数据
 * @returns {Buffer} 包含 IV + ciphertext + authTag
 */
export function encrypt(data: Buffer | string) {
    if (!Buffer.isBuffer(data)) data = Buffer.from(data);

    const iv = crypto.randomBytes(12); // 12字节 IV（GCM 推荐）
    const cipher = crypto.createCipheriv('aes-128-gcm', KEY, iv);

    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();

    // 格式: [IV(12字节)] + [Ciphertext] + [AuthTag(16字节)]
    return Buffer.concat([iv, ciphertext, tag]);
}

/**
 * 解密
 * @param {Buffer} encrypted - 加密数据 (IV + ciphertext + authTag)
 * @returns {Buffer} 明文
 */
export function decrypt(encrypted: Buffer) {
    const iv = encrypted.slice(0, 12);
    const tag = encrypted.slice(encrypted.length - 16);
    const ciphertext = encrypted.slice(12, encrypted.length - 16);

    const decipher = crypto.createDecipheriv('aes-128-gcm', KEY, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}