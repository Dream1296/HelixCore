
const db = require('../config/db/mysql');

export function getTreeNode(id:string | number) {
    return new Promise((resolve,rejects)=>{
        const ids = Number(id);
        const sql = 'select * from tree where id = ?;';
        db.query(sql,ids,(error:any,results:any)=>{
           if(error) {
             return rejects('0');
           }
           resolve(results);
       })
    })
}