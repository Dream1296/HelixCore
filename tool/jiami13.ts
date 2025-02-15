import * as crypto from 'crypto';
// const db = require('./src/config/db/mysql');

let key = "A8412640";

let text1 = ``

let res = jiamiString(text1,key);
console.log("^AES^" + res);

// sqlC<{id:number,text:string}[]>('SELECT id,text FROM dt WHERE loa = 13;')
// .then( 
//    async (data ) => {
//         for(let i = 0; i < data.length; i++){
//             if(data[i].id != 377){
//                 continue;
//             }
//             let text1 = data[i].text;
//             let text2 = mi.jiamis(text1,key);
//             text2 = "AES" + text2;
//             let sql = `UPDATE dt SET text = '${text2}' WHERE id = ${data[i].id};`;
//             console.log(sql);
            
//             await sqlC(sql);
//         }
//     }
// )
// let txt = ``;

// let a = mi.jie(txt,key);
// console.log(a);





// sql语句执行
// function sqlC<T>(sqlStr: string,canshu?:string[]):Promise<T> {

//     return new Promise((resolve, rejects) => {
//         if(canshu){
//             db.query(sqlStr,canshu, (error: any, results: any) => {
//                 if (error) {
    
//                 }
//                 resolve(results)
//             })
//         }else{
//             db.query(sqlStr, (error: any, results: any) => {
//                 if (error) {
    
//                 }
//                 resolve(results)
//             })
//         }
       
//     })
// }


function jiamiString(text: string, password: string): string {
    // 使用密码生成密钥
    const key: Buffer = crypto.createHash('sha256').update(password).digest();
  
    // 创建加密器，不使用IV
    const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));
  
    // 加密文本
    let encryptedString: string = cipher.update(text, 'utf8', 'hex');
    encryptedString += cipher.final('hex');
  
    return encryptedString;
  }
  



