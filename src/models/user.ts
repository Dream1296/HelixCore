// const db = require('../config/db/mysql');
import { dbSql } from "@/utils/dbSql";

// 查询
async function userIn(user: string) {
    let a = await prisma?.dt_user.findMany({
        where: {
            id: user
        },
        select: {
            id: true,
            name: true,
        }
    })
    if (!a) {
        return undefined;
    } else {
        return a.map(user => ({
            user: user.id,
            name: user.name,
        }));
    }
}

async function userImgUrl(user: string) {
    let a = await prisma?.dt_user.findMany({
        where:{
            id:user
        },
        select:{
            user_img:true,
        }
    })
    if(a && a[0]){
        return a[0].user_img;
    }
    return undefined;
}

export async function setMoodM(user: string, date: string, mood: string) {
    let sql = "INSERT INTO dt_mood (user, date, mood) VALUES (?, ?, ?);";

    let a = await dbSql<number>(sql, [user, date, mood], true);
    return a;
}

export { userIn, userImgUrl }