import { redisDB } from "@/config/db/redis";
import { BadmintonData, Comtent, KeepRunRecord, List, Lists, dtFile } from "../type";
const mi = require("../utils/usErcrypto");
const db = require('../config/db/mysql');
import { dbSql } from "@/utils/dbSql";
import moment from "moment";
import { chinese_English } from "@/tool/chineseTrEnglish";



//获取动态列表
async function dtList(user: string, loa: number | string) {
    //获取主列表
    let list: Lists[] = await dtLists(user, loa);

    //获取评论信息
    let comment: Comtent[] = await dtComment();
    //混淆非公开评论
    jiamiConmit(comment, loa);

    // 我也不知道为什么要清空这个！！！！
    for (let i = 0; i < list.length; i++) {
        list[i].textTile = "";
    }

    //评论添加
    let addCommentCb = (b: Lists, a: any) => {
        if (!b.com) {
            b.com = [];
        }
        b.com?.push(a);
    }
    fusionObj(list, comment, 'com', undefined, undefined, addCommentCb);

    //文件外链
    let dtFile = await getDtFile();
    let addDtFileCb = (b: Lists, a: any) => {
        b.File = ({
            name: a.name,
            fileId: a.dt_id.toString()
        })
    }
    fusionObj(list, dtFile, 'File', undefined, undefined, addDtFileCb);

    //标签，标记
    let keywords: { keyword: string, dt_id: string, isAi: number }[] = await sqlGetDtIndexAll() as { keyword: string, dt_id: string, isAi: number }[];
    let addKeywordsCb = (b: Lists, a: any) => {
        if (!b.keyword) {
            b.keyword = [];
        }
        b.keyword?.push({
            keyword: a.keyword,
            isAi: a.isAi,
        })
    }
    fusionObj(list, keywords, 'keyword', undefined, undefined, addKeywordsCb);

    //长视频挂载
    let vlList = await getLongVideoList();
    let addVlistCb = (b: Lists, a: any) => {
        if (!b.longVideo) {
            b.longVideo = [];
        }
        b.longVideo?.push({ id: a.id, name: a.name, src: a.src })
    }
    fusionObj(list, vlList, 'longVideo', undefined, undefined, addVlistCb);

    //长文章挂载
    let textList = await getText();
    fusionObj(list, textList, 'textTile', 'tile');

    //运动跑步
    let runList = await getKeepRunList();
    fusionObj(list, runList, 'KeepRun', undefined, 'ocr_text');

    //运动羽毛球
    let keepBadmintonList = await getKeepBadmintonList();
    fusionObj(list, keepBadmintonList, 'KeepBadminton', undefined, 'ocr_text');

    //排序
    const sortedArray = list.sort((a, b) => {
        // 先比较 po 属性，从大到小排序  
        if (a.po !== b.po) {
            return b.po - a.po;
        }
        // 如果 po 属性相等，且都为 0，则比较 date 属性，从小到大排序  
        if (a.po === 0 && b.po === 0) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
    });

    return sortedArray;
}

//从redis中找动态列表数据
export async function getRedisListData(user: string, loa: Number, aes: Number) {
    let key = user + loa.toString() + aes.toString();
    let data = await redisDB.get(key) as string;
    return JSON.parse(data) as Lists[];
}


//查询动态长文
export async function getText() {
    let data = await dbSql<{ id: number, dtid: string, title: string, data: string, user: string, loa: number, notes: string }[]>('SELECT * FROM dt_text')
    return data;
}

/***
 * @param list - 主列表
 * @param obj - 需要挂载的小列表
 * @param name - 主列表中挂载的属性名
 * @param dataName - 列表属性
 * @param delName - 需要覆盖的字段
 * @param cb - 自定义添加规则，
 */

//列表追加
function fusionObj(list: Lists[], obj: any[], name: string, dataName?: string, delName?: string, cb?: (list: Lists, obj: any) => void) {
    for (let a of obj) {
        let b = list.find(obj => obj.id == a.dt_id);
        if (!b) {
            b = list.find(obj => obj.id == a.dtId);
        }
        if (!b) {
            b = list.find(obj => obj.id == a.dtid);
        }
        if (!b) {
            continue;
        }
        if (delName) {
            a[delName] = "";
        }
        if (cb) {
            cb(b, a);
        } else {
            if (dataName) {
                // @ts-expect-error
                b[name] = a[dataName];
            } else {
                // @ts-expect-error
                b[name] = a;
            }

        }
    }
}

//获取跑步信息
async function getKeepRunList() {
    let list = await dbSql<KeepRunRecord[]>('SELECT * FROM `keep_run`');
    return list
}

//获取羽毛球信息
export async function getKeepBadmintonList() {
    let list = await dbSql<BadmintonData[]>('SELECT * FROM `keep_badminton`');
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
            dt.idea as idea,
            dt.bg_style as bgStyle,
            dt.pin_order as po,
            dt.loa as loa
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
    dt_name.name ,
    dt_comments.loa
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

// 加密评论
function jiamiConmit(Comtent: Comtent[], loa: number | string) {
    if (Number(loa) == 0) {
        for (let i = 0; i < Comtent.length; i++) {
            if (Comtent[i].loa != 0) {
                Comtent[i].content = chinese_English(Comtent[i].content);
            }
        }
    }
}

//单个动态的数据
async function getdts(user: string, id: number, loa: number) {
    let data: Lists[] = await dtLists(user, loa, id) as Lists[];
    if (data.length == 0) {
        return null;
    }
    let list: Lists = data[0];


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

// 获取长视频列表
export async function getLongVideoList(id?: number) {
    let sql
    if (id) {
        sql = `SELECT id,dt_id,name,src FROM dt_longVideo where id = ${id}`;
    } else {
        sql = `SELECT id,dt_id,name,src FROM dt_longVideo`;
    }
    let lvList = await dbSql<{ id: number, dt_id: number, name: string, src: string }[]>(sql);
    return lvList
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

//获取动态文件目录
export async function getDtFile() {
    let sql = "SELECT * FROM `dt_file`";
    let data = await dbSql<dtFile[]>(sql);
    return data;
}

//根据dtid查询文件
export async function findFile(id: string) {
    if (!id) {
        return undefined
    }
    let sql = "SELECT * FROM dt_file where dt_id = ?";
    let data = await dbSql<dtFile[]>(sql, [id]);
    return data;
}

//查询动态id对应信息
export async function getDtUser(dtid: number) {
    let sql = `SELECT user,loa FROM dt WHERE id = ?`;
    return dbSql<{ user: string, loa: number }[]>(sql, [dtid.toString()]);

}

async function setKeyword(id: number, keyword: string, isAi: number): Promise<boolean> {
    let sqlStr = `INSERT INTO dt_index (id, keyword, dt_id, isAi) VALUES (null, ?, ?, ?);`;
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
export async function setImg(id: string, imgArr: string[], imgSrc: string, headNum?: number) {
    let falg = true;
    if (!headNum) {
        headNum = 0;
    }
    for (let i = headNum; i < imgArr.length; i++) {
        let sql = `INSERT into dt_img (dt_id,img_index,img_src,img_name) VALUES (?,?,?,?)`;
        let a = await dbSql<number>(sql, [id, i.toString(), imgSrc, imgArr[i]]);
        if (a != 1) {
            falg = false;
        }
    }
    return falg
}

//添加视频
export async function setVideo(id: string, videoArr: string[], headNum?: number) {
    let falg = true;
    if (!headNum) {
        headNum = 0;
    }
    for (let i = headNum; i < videoArr.length; i++) {
        let sql = `INSERT into dt_video (dt_id,video_index,video_src)
        VALUES (?,?,?)`;
        let a = await dbSql(sql, [id, i.toString(), videoArr[i]])
        if (a != 1) {
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
    let dateReal = moment().format('YYYY-MM-DD HH:mm');
    let sql = `INSERT INTO dt (id,user, text, img,img_show_num, img_all_num ,video,video_num, date, loa,date_real) VALUES 
                (?,?, ?, '0', ?, ?, '0', ?,?,?,?  );`;
    let canshuArr = [id, user, text, img_show_num, img_all_num, video_num, date, loa, dateReal];
    let a = await dbSql<number>(sql, canshuArr, true);
    if (a == 1) {
        return true
    }
    return false

}

async function setDtCom(date: string, content: string, dtId: string, commentsUser: string) {
    let sql = "INSERT INTO dt_comments (date, content, dtId, commentsUser,loa) VALUES (?,?,?,?,1)";
    let canshuArr = [date, content, dtId, commentsUser];
    let a = await dbSql(sql, canshuArr, true);
    if (a == 1) {
        return { tf: 1 };
    }
    return { tf: 0 };

}

export async function getDtLongData(dtid: string) {
    let data = await dbSql<{ dtid: string, data: string, type: string, notes: string }[]>("SELECT * FROM dt_text  WHERE dtid = ?", [dtid]);
    if (data.length != 1) {
        return null;
    }
    return data[0];
}

export async function setDtM(id: string, updates: any) {
    // 构造动态的 SQL 语句
    const fieldsToUpdate = [];
    const values = [];

    // 遍历请求体中的字段，构造更新语句
    for (const [field, value] of Object.entries(updates)) {
        if (value == null || value == undefined) {
            continue;
        }
        fieldsToUpdate.push(`${field} = ?`);
        values.push(value);
    }

    // 如果没有要更新的字段，返回错误
    if (fieldsToUpdate.length === 0) {
        return 404;
    }

    // 添加 ID 条件
    const sql = `UPDATE dt SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    values.push(id);

    let tf = await dbSql(sql, values, true);
    if (tf == 1) {
        return 200;
    }

}


export async function setDtBgStyle(dtId: number, bgStyle: number) {
    let sql = "UPDATE dt  SET bg_style = ?  WHERE id = ?;"
    let a = await dbSql<number>(sql, [bgStyle, dtId], true);
    if (a) {
        return true;
    } else {
        return false;
    }


}

async function delDt(dtId: string) {
    let falg;
    let sql = "UPDATE dt  SET shows = 0  WHERE id = ?;";
    let a = await dbSql<number>(sql, [dtId], true);
    if (a == 1) {
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
    let dtData = await dbSql<{ id: number, video: string }[]>('SELECT id,video FROM dt');
    let falg = true;
    for (let a of dtData) {
        if (a.video == '0' || a.video == '') {
            continue;
        }
        let num = a.video.split('-').length;
        let b = await dbSql<number>(`UPDATE dt SET video_num = '${num}' WHERE dt.id = ${a.id};`, undefined, true);
        if (b != 1) {
            falg = falg;
        }

    }
    return falg
}

//图片处理
export async function videos() {
    let i = 0;
    let falg = true;
    let dtData = await dbSql<{ id: number, video: string }[]>('SELECT id,video FROM dt');
    // return


    for (let a of dtData) {
        if (a.video == '0') {
            continue;
        }

        let arr = a.video.split('-');
        let index = 0;
        for (let b of arr) {

            let sql = `INSERT INTO dt_video (id, dt_id, video_index, video_src) VALUES (NULL, ${a.id}, ${index}, '${b}');`

            let c = await dbSql<number>(sql, undefined, true);
            if (c != 1) {
                falg = false;
            }
            index++;
        }
    }
    return falg;
}


export async function setShareDb(key: string, user: string, dtid: string) {
    let sql = `INSERT INTO  dt_share (id, K,user, date, dtid) VALUES (NULL,?, ?, NOW(), ?);`;
    let tf = await dbSql<number>(sql, [key, user, dtid], true);
    if (tf == 1) {
        return true;
    }
    return false;
}

export async function getShareDbToken(key: string) {
    let sql = `SELECT user,dtid FROM dt_share where k = ?`;
    let a = await dbSql<{ user: string, dtid: string }[]>(sql, [key]);
    return a;
}


export async function setUserss(user: string, dtid: string) {
    let sql = `SELECT * FROM dt WHERE user = ? and id = ?`;
    let is = await dbSql<any[]>(sql, [user, dtid]);
    if (is.length > 0) {
        return true;
    }
    return false;

}

export async function dtidS(dtid: string) {
    let sql = `SELECT user,loa,shows FROM dt where id = ?`;
    let res = await dbSql<{ user: string, loa: number, shoes: number }[]>(sql, [dtid]);
    return res;
}


export { dtList, dtDate, setDt, setDtCom, delDt, getdts, setdtindex }