// const db = require('../config/db/mysql');
import { dbSql } from "@/utils/dbSql";


async function userIn(user:string){
    let a = await dbSql<{user:string,name:string}[]>('SELECT user,name FROM `passwd` WHERE user = ? ',
        [user]
    );
    if(a.length > 0){
        return a[0];
    }else{
        return '0';
    }
}

async function userImgUrl(user:string){
    let a = await dbSql<{touxian:string}[]>('SELECT touxian FROM `dt_name` WHERE user = ? ',
        [user],
    );
    if(a.length > 0){
        return a[0];
    }
    return '0';
}

export async function setMoodM(user:string,date:string,mood:string){
    let sql = "INSERT INTO dt_mood (user, date, mood) VALUES (?, ?, ?);";
    
    let a = await dbSql<number>(sql,[user,date,mood],true);
    return a;
}

export {userIn,userImgUrl}