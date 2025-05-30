import { BadmintonData, dtFile, KeepRunRecord } from "@/type";
import { dbSql } from "@/utils/dbSql";
import moment from "moment";
import { prisma } from '@/config/prisma'


//获取跑步信息
export async function getKeepRunList() {
    let list = await dbSql<KeepRunRecord[]>('SELECT * FROM `keep_run`');
    return list
}

//获取羽毛球信息
export async function getKeepBadmintonList() {
    let list = await dbSql<BadmintonData[]>('SELECT * FROM `keep_badminton`');
    // let list:BadmintonData[] = await prisma.keep_badminton.findMany();
    return list;
}


export async function setKeyword(id: number, keyword: string, isAi: number): Promise<boolean> {
    let sqlStr = `INSERT INTO dt_index (id, keyword, dt_id, isAi) VALUES (null, ?, ?, ?);`;
    let falg = await dbSql<number>(sqlStr, [keyword, id, isAi], true)
    if (falg == 1) {
        return true;
    }
    return false;
}

//查询单条动态对应的标签
export async function sqlGetDtIndex(id: number): Promise<{ keyword: string, isAi: number }[]> {
    let sqlStr = `SELECT keyword,isAi FROM dt_index WHERE dt_id = ${id}`;
    let data = await dbSql<{ keyword: string, isAi: number }[]>(sqlStr);
    if (data.length == 0) {
        data.push({ keyword: 'null', isAi: 1 });
    }
    return data;
}

//从评论表中查询图片权限信息
// export async function dtComS(comId: number) {
//     // let sql = `SELECT commentsUser as user,loa FROM dt where id = ?`;
//     // let res = await dbSql<{ user: string, loa: number, shoes: number }[]>(sql, [comId]);
//     let res = await prisma.dt.findUnique({
//         where: {
//             id: comId
//         },
//         select: {
//             commentsUser: true,
//             loa: true,
//             shoes: true
//         }
//     })
//     return res;
// }

export async function delDtData(dtId: number) {
    try {
        await prisma.dt.update({
            where: {
                id: Number(dtId),
            },
            data: {
                shows: false
            }
        })
        return true;
    } catch (error) {
        return false
    }
}

export async function dtComment(findId?: number) {
    return await prisma.dt_comments.findMany({
        where: {
            shoes: 1,
            dtId: findId
        },
        include: {
            userInfo: true,
        },
        orderBy: {
            date: 'asc'
        }
    })
}


//查询动态长文
export async function getText() {
    // let data = await dbSql<{ id: number, dtid: string, title: string, data: string, user: string, loa: number, notes: string }[]>('SELECT * FROM dt_text')
    return await prisma.dt_text.findMany();
}

//查询动态标签
export async function sqlGetDtIndexAll() {
    return await prisma.dt_index.findMany({
        select: {
            keyword: true,
            dt_id: true,
            isAi: true
        }
    });

}


//获取动态文件目录
export async function getDtFile() {
    return await prisma.dt_file.findMany();
}
