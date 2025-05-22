//生成token
// const mi = require('../utils/usErcrypto');
import { TokenObj } from "@/type";
import { createSignature, jiami, jie, verifySignature } from "@/utils/cryptoUtils";

const passwd = process.env.tokenPasswd! + process.env.tokenR!;
const day = 30;
const mintime = 10;

//传入用户名，生成token
function generateToken(username: string) {
    //当前事件戳
    let nowDate = +new Date() ;
    let key:TokenObj;
    key = {
        user_id:username,
        dtid:"-1",
        date:nowDate,
        type:'ltk'
    }
    
    let token = Buffer.from(JSON.stringify(key)).toString('base64');
    token = token +'|' + createSignature(token,passwd);

    return token;
}

//传入用户名，生成临时token
function generateTempToken(username: string){
    //当前事件戳
    let nowDate = +new Date();
    let key:TokenObj;
    key = {
        user_id:username,
        dtid:"-1",
        date:nowDate,
        type:'rat'
    }
    
    let token = Buffer.from(JSON.stringify(key)).toString('base64');
    token = token +'|' + createSignature(token,passwd);
    return token;
}


//传入token获取用户对象
function getUser(token: string):TokenObj {
    let guest:TokenObj = {
        user_id:'guest',
        dtid:"-1",
        date:0,
        type:'ltk',
    }
    if(token == ''){
        return guest;
    }


    let tokenStr = token.split('|')[0];
    let tokenc = token.split('|')[1];

    let falg = verifySignature(tokenStr,tokenc,passwd);

    

    if(!falg){
        return guest
    }

    let tokenObj:TokenObj =  JSON.parse( Buffer.from(tokenStr, 'base64').toString('utf8') ); 
    
    if(tokenObj.type =='ltk' && ( +new Date()) > tokenObj.date + (day * 24 * 60 * 60 * 1000) ){
        return guest;
    }
    if(tokenObj.type == 'rat' && ( +new Date()) > tokenObj.date + (mintime  * 60 * 1000) ){
        return guest;
    }

    return tokenObj
}

//生成动态分享token
export function getShareToken(username: string,dtid:string){
    //当前事件戳
    let nowDate = +new Date();
    let key:TokenObj;
    key = {
        user_id:username,
        dtid:dtid,
        date:nowDate,
        type:'rat'
    }
    
    let token = Buffer.from(JSON.stringify(key)).toString('base64');
    token = token +'|' + createSignature(token,passwd);
    return token;
}







export { generateToken, getUser ,generateTempToken}
