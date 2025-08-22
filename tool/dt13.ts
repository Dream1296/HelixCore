import {jiamiString , jie} from '../src/utils/cryptoUtils';
import { dbSql } from '../src/utils/dbSql';
let key = 'A8412640';

// jiemi();


async function jiami(){
    return
    let textArr = await dbSql<{id:number,text:string}[]>("SELECT id,text FROM dt WHERE loa = 13;");
    for(let a of textArr){
        let text = a.text;
        text = '^AES^' + jiamiString(text,key);

        await dbSql(`UPDATE dt SET text = '${text}' WHERE id = ${a.id};`);

    }
    console.log('OK');
}




async function jiemi(){
    let textArr = await dbSql<{id:number,text:string}[]>("SELECT id,text FROM dt WHERE loa = 13;");
    for(let a of textArr){
        let text = a.text;
        text = jie(text.slice(5),key);
        console.log(text);
        
        // await sqlC(`UPDATE dt SET text = '${text}' WHERE id = ${a.id};`);

    }
}   