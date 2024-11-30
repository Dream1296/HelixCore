// src/cryptoUtils.ts

import * as crypto from 'crypto';

/**
 * 待加密对象的类型定义
 */
interface ObjectToEncrypt {
  [key: string]: any;
}

/**
 * 加密函数
 * @param objToEncrypt - 需要加密的对象
 * @param password - 用于加密的密码
 * @returns 加密后的十六进制字符串
 */
export function jiami(objToEncrypt: ObjectToEncrypt, password: string): string {
  const jsonString: string = JSON.stringify(objToEncrypt);
  const key: Buffer = crypto.createHash('sha256').update(password).digest();
  const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));
  let encryptedString: string = cipher.update(jsonString, 'utf8', 'hex');
  encryptedString += cipher.final('hex');

  return encryptedString;
}

/**
 * 另一个加密函数，直接加密文本
 * @param text - 需要加密的文本
 * @param password - 用于加密的密码
 * @returns 加密后的十六进制字符串
 */
export function jiamiString(text: string, password: string): string {
  // 使用密码生成密钥
  const key: Buffer = crypto.createHash('sha256').update(password).digest();

  // 创建加密器，不使用IV
  const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));

  // 加密文本
  let encryptedString: string = cipher.update(text, 'utf8', 'hex');
  encryptedString += cipher.final('hex');

  return encryptedString;
}

/**
 * 解密函数
 * @param encryptedString - 加密后的十六进制字符串
 * @param password - 用于解密的密码
 * @returns 解密后的字符串，若解密失败则返回默认对象的JSON字符串
 */
export function jie(encryptedString: string, password: string): string {
  try {
    const key: Buffer = crypto.createHash('sha256').update(password).digest();
    const decipher: crypto.Decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16));
    let decryptedString: string = decipher.update(encryptedString, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');
    return decryptedString;
  } catch (error) {
    const a = {
      username: 'guest',
      dates: "0",
    };
    return JSON.stringify(a);
  }
}


/**
 * 签名函数
 * @param data - 需要签名的字符串
 * @param secretKey - 用于解密的密码
 * @returns 签名的后的字符串
 */
export function createSignature(data: string, secretKey: string): string {  
  return crypto.createHmac('sha256', secretKey)  
      .update(data)  
      .digest('hex');  
}

/**
 * 验证签名函数
 * @param data - 待验证的字符串
 * @param secretKey - 用于解密的密码
 * @param signature - 预期的签名
 * @returns 签名是否正确
 */

export function verifySignature(data: string, signature: string, secretKey: string): boolean {  
  const generatedSignature = createSignature(data, secretKey);  
  return generatedSignature === signature;  
}



