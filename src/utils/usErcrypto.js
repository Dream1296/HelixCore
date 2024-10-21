const crypto = require('crypto');


//加密
function jiami(objToEncrypt, password) {

    // 将对象转换为 JSON 字符串
    const jsonString = JSON.stringify(objToEncrypt);

    // 使用密码生成密钥
    const key = crypto.createHash('sha256').update(password).digest();

    // 创建加密器，不使用IV
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));

    // 加密对象
    let encryptedString = cipher.update(jsonString, 'utf8', 'hex');
    encryptedString += cipher.final('hex');

    return encryptedString;
}

function jiamis(text,password){
        // 使用密码生成密钥
        const key = crypto.createHash('sha256').update(password).digest();

        // 创建加密器，不使用IV
        const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));
    
        // 加密对象
        let encryptedString = cipher.update(text, 'utf8', 'hex');
        encryptedString += cipher.final('hex');
    
        return encryptedString;
}

//解密
function jie(encryptedString, password) {
    try {
        // 使用密码生成密钥
        const key = crypto.createHash('sha256').update(password).digest();

        // 创建解密器，不使用IV
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16));

        // 解密字符串
        let decryptedString = decipher.update(encryptedString, 'hex', 'utf8');
        decryptedString += decipher.final('utf8');
        return decryptedString;
    } catch (error) {
        let a = {
            username: 'guest',
            dates: "0",
        }
        return JSON.stringify(a);
    }

}

module.exports = {
    jiami,
    jie,
    jiamis
}