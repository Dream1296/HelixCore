import { dbSql } from "@/utils/dbSql";


//  Vector增加
export async function vectorAdd(){
    let sql = 'SELECT dtId,content FROM dt_comments'
    let data = await dbSql<{dtId:number,content:string}[]>(sql,undefined,false);
    for(let i = 0; i < data.length; i++){
        let id = data[i].dtId;
        let text = data[i].content;
        let sql = 'INSERT INTO dt_find (dt_id, type, text) VALUES (?, 1, ? );';
        await dbSql(sql,[id,text],false,'ai');
        console.log(id + '/' + data.length);
    }

}
// export async function vectorAdd(){
//     let sql = 'SELECT id,text FROM dt'
//     let data = await dbSql<{id:number,text:string}[]>(sql,undefined,false);
//     for(let i = 0; i < data.length; i++){
//         let id = data[i].id;
//         let text = data[i].text;
//         let sql = 'INSERT INTO dt_find (dt_id, type, text) VALUES (?, 0, ? );';
//         await dbSql(sql,[id,text],false,'ai');
//         console.log(id + '/' + data.length);
//     }

// }
