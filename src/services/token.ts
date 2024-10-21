//生成token
// const mi = require('../utils/usErcrypto');
import { jiami, jie } from "@/utils/cryptoUtils";
import { Key as Keys} from "@/utils/passwd";

const passwd = Keys.Password;

//传入用户名，生成token
function generateToken(username: string) {
    // return mi.jiami(username,'123456');

    //当前事件戳
    let nowDate = +new Date();
    const term = 7;
    nowDate = Math.floor(nowDate / 1000 + 60 * 60 ** 24 * term);
    const key = {
        username: username,
        dates: nowDate
    };
    const token = jiami(key, passwd);
    return token;
}

//传入token获取用户对象
function getUser(token: string) {
    
    let decryptedObject:{dates:number,username:any};
    try{
        decryptedObject = JSON.parse(jie(token, passwd));
    }catch{
        return {
            username:'guest'
        }
    }

    // 检查解密后的对象中的日期是否大于当前日期
    let date = Math.floor(+new Date() / 1000);
    if (decryptedObject.dates < date) {
        return {
            username: 'guest',
        };
    }

    return {
        username: decryptedObject.username,
    };

}

export { generateToken, getUser }
