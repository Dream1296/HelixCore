import { Comtent, List, Lists } from "../type";
const mi = require("../utils/usErcrypto");
const db = require('../config/db/mysql');
import { dbSql } from "@/utils/dbSql";
// sql语句执行
// export function sqlC<T>(sqlStr: string,canshu?:string[]):Promise<T> {

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




//获取动态列表
async function dtList(user: string, loa: number | string) {
    //获取列表
    let list: Lists[] = await dtLists(user, loa);

    let comment: Comtent[] = await dtComment();

    for (let i = 0; i < list.length; i++) {
        let com = findCom(list[i], comment);
        list[i].com = com;
    }

    let keywords: { keyword: string, dt_id: string, isAi: number }[] = await sqlGetDtIndexAll() as { keyword: string, dt_id: string, isAi: number }[];

    for (let keyword of keywords) {
        let lists = list.find(obj => obj.id == keyword.dt_id);
        if (!lists) {
            break
        }
        if (!lists.keyword) {
            lists.keyword = [];
        }
        lists.keyword.push({
            keyword: keyword.keyword,
            isAi: keyword.isAi,
        })
    }
    return list;
}




//找动态中的评论
function findCom(list: Lists, comment: Comtent[]) {
    let id = list.id;
    let a = comment.filter(obj => obj.dtId == id);
    return a;
}

//从数据库中获取动态主数据
export async function dtLists(user: string, loa: number | string, findId?: number | string) {
    let sqlend = '';
    if (Number(loa) == 13 && user == 'yw') {
        sqlend = `dt.loa = 13`
    } else
        if (Number((loa)) == 1 && user != 'guest') {
            sqlend = `((dt.loa = 1 AND dt.user = '${user}') OR dt.loa = 0) `;
        } else {
            sqlend = `dt.loa = 0`;
        }
    let findIdStr = findId ? `AND dt.id = ${findId}` : '';
    let sqlStr = `
        select
            dt.id as id,
            dt.user as user,
            dt_name.name as name,
            dt_name.touxian as touxian,
            dt.text as text,
            dt.img_show_num as imgShowAll,
            dt.img_all_num as imgAllNum,
            dt.video_num as videoNum,
            dt.date as date,
            dt.idea as idea
        from dt
            join dt_name on dt.user = dt_name.user
        where
            ${sqlend}  AND dt.shows = 1 ${findIdStr}
        order by dt.date desc;
    `;

    let data = await dbSql<Lists[]>(sqlStr);
    for (let i = 0; i < data.length; i++) {
        if (data[i].text.startsWith("^AES^") && loa == 13) {
            data[i].text = mi.jie(data[i].text.slice(5), "A8412640");
        }
    }
    return data;
}

//查询评论
export async function dtComment(findId?: number | string): Promise<Comtent[]> {
    let findIdStr = findId ? `AND dt_comments.dtId = ${findId}` : '';
    let sqlStr = `SELECT     
    dt_comments.date,  
    dt_comments.content,  
    dt_comments.dtId,  
    dt_comments.commentsUser,  
    dt_name.name  
FROM  
    dt_comments  
JOIN     
    dt_name 
ON 
	dt_comments.commentsUser =dt_name.user 
where 
    true ${findIdStr}
ORDER BY dt_comments.date ASC;`;


    let data = await dbSql<Comtent[]>(sqlStr);
    return data;

}

//单个动态的数据
async function getdts(user: string, id: number) {

    let list: Lists = (await dtLists('yw', 1, id) as Lists[])[0];

    //评论
    let comment: Comtent[] = await dtComment(id);

    list.com = comment;

    //标签
    let keyword = await sqlGetDtIndex(id);
    list.keyword = keyword;

    return list;
}

//添加标签
async function setdtindex(id: number, keyword: string, isAi: number) {
    //判断keyworld表中是否已存在
    let falg = await iskeywords(id, keyword);
    if (falg) {
        return true
    }
    falg = await setKeyword(id, keyword, isAi);
    return falg;
}




//查询单条动态对应的标签
async function sqlGetDtIndex(id: number): Promise<{ keyword: string, isAi: number }[]> {
    let sqlStr = `SELECT keyword,isAi FROM dt_index WHERE dt_id = ${id}`;
    let data = await dbSql<{ keyword: string, isAi: number }[]>(sqlStr);
    if (data.length == 0) {
        data.push({ keyword: 'null', isAi: 1 });
    }
    return data;

}
//查询动态标签
export async function sqlGetDtIndexAll() {
    let sqlStr = `SELECT keyword,dt_id,isAi FROM dt_index `;
    return await dbSql<{ keyword: string, dt_id: string, isAi: number }[]>(sqlStr)

}
//判断标签是否存在
async function iskeywords(id: number, keyword: string) {
    let arr = await sqlGetDtIndex(id);
    for (let e of arr) {
        if (e.keyword == keyword) {
            return true
        }
    }
    return false;
}

async function setKeyword(id: number, keyword: string, isAi: number): Promise<boolean> {
    let sqlStr = `INSERT INTO dtindex (id, keyword, dt_id, isAi) VALUES (null, ?, ?, ?);`;
    let falg = await dbSql<number>(sqlStr, [keyword, id, isAi], true)
    if (falg == 1) {
        return true;
    }
    return false;
}


async function dtDate(year: number | string) {
    let sql = `SELECT date FROM dt WHERE YEAR(date) = ${year}`;
    let results = await dbSql<{ date: string }[]>(sql);
    let a = [];
    for (let i = 0; i < results.length; i++) {
        a[i] = JSON.stringify(results[i].date).split('T')[0].split('"')[1].split('-').join(',')
    }
    return a;
}

//添加图片
export async function setImg(id: string, imgArr: string[]) {
    let falg = true;
    for (let i = 0; i < imgArr.length; i++) {
        let sql = `INSERT into dt_img (dt_id,img_index,img_src) VALUES (?,?,?)`;

        let a = await dbSql<number>(sql, [id, i.toString(), imgArr[i]]);
        if(a != 1){
            falg = false;
        }
    }
    return falg
}

//添加视频
export async function setVideo(id: string, videoArr: string[]) {
    let falg = true;
    for (let i = 0; i < videoArr.length; i++) {
        let sql = `INSERT into dt_video (dt_id,video_index,video_src)
        VALUES (?,?,?)`;
        let a = await dbSql(sql, [id, i.toString(), videoArr[i]])
        if(a != 1){
            falg = false;
        }
    }
    return falg;
}
//查询动态id值
export async function getIdMax() {
    let ids = await dbSql<{ id: string }[]>('SELECT MAX(id) as id FROM dt;');
    return ids[0].id + 1;
}

//添加主数据
async function setDt(id: string, user: string, text: string, img_show_num: string, img_all_num: string, video_num: string,
    date: string, loa: string, idea?: string): Promise<boolean> {

        let sql = `INSERT INTO dt (id,user, text, img,img_show_num, img_all_num ,video,video_num, date, loa) VALUES 
                (?,?, ?, '0', ?, ?, '0', ?,?,?  );`;
                let canshuArr = [id, user, text, img_show_num, img_all_num, video_num, date, loa];
        let a = await dbSql<number>(sql,canshuArr,true);
        if(a == 1){
            return true
        }
        return false

}

async function setDtCom(date: string, content: string, dtId: string, commentsUser: string) {
    let sql = "INSERT INTO dt_comments (date, content, dtId, commentsUser) VALUES (?,?,?,?)";
    let canshuArr =  [date, content, dtId, commentsUser];
    let a = await dbSql(sql,canshuArr,true);
    if(a == 1 ){
        return { tf: 1 };
    }
    return {tf : 0};
    
}

async function delDt(dtId: string) {
    let falg;
    let sql = "UPDATE dt  SET shows = 0  WHERE id = ?;";
    let a = await dbSql<number>(sql,[dtId],true);
    if(a == 1){
        return { tf: 1 }
    }
    return { tf: 0 }
}

function splitContent(content: string) {
    // 确保 content 是字符串
    if (typeof content !== "string") {
        content = String(content);
    }

    // 先用 ^ 分割字符串
    const parts = content.split("^");


    let result = [];

    if (parts.length == 1) {
        result.push({
            type: "text",
            text: parts[0],
        });
        return result;
    }

    for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i].startsWith("[") && parts[i].endsWith("]")) {
            result.push({
                type: "emoji",
                text: parts[i].slice(1, parts[i].length - 1),
            });
        } else {
            result.push({
                type: "text",
                text: parts[i],
            });
        }
    }

    return result;
}








export async function videoNum() {
    let dtData = await dbSql<{ id: number, video: string }[]>('SELECT id,video FROM dt') ;
    let falg = true;
    for (let a of dtData) {
        if (a.video == '0' || a.video == '') {
            continue;
        }
        let num = a.video.split('-').length;
        let b = await dbSql<number>(`UPDATE dt SET video_num = '${num}' WHERE dt.id = ${a.id};`,undefined,true);
        if(b != 1){
            falg = falg;
        }

    }
    return falg
}

//图片处理
export async function videos() {
    let i = 0;
    let falg = true;
    let dtData = await dbSql<{ id: number, video: string }[]>('SELECT id,video FROM dt') ;
    // return


    for (let a of dtData) {
        if (a.video == '0') {
            continue;
        }

        let arr = a.video.split('-');
        let index = 0;
        for (let b of arr) {

            let sql = `INSERT INTO dt_video (id, dt_id, video_index, video_src) VALUES (NULL, ${a.id}, ${index}, '${b}');`

            let c = await dbSql<number>(sql,undefined,true);
            if( c != 1){
                falg = false;
            }
            index++;
        }
    }
    return falg;
}



export { dtList, dtDate, setDt, setDtCom, delDt, getdts, setdtindex }