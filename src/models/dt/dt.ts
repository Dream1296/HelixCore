import { redisDB } from "@/config/db/redis";
import { BadmintonData, Comtent, KeepRunRecord, List, Lists, dtFile } from "../../type";
const mi = require("../../utils/usErcrypto");
import { dbSql } from "@/utils/dbSql";
import moment from "moment";
import { chinese_English } from "@/tool/chineseTrEnglish";
import { prisma } from '@/config/prisma';
import { delDtData, dtComment, getDtFile, getDtVideoFile, getKeepBadmintonList, getKeepRunList, getText, setDtVideo, setImgDt, setKeyword, sqlGetDtIndex, sqlGetDtIndexAll } from "./queries";
import { formatComment, fusionObj, iskeywords, jiamiConmit } from "./helpers";
import path from "path";
import { getUrl } from "@/pathUtils";



/**
 * 主动态列表
 * @returns 
 */
export async function dtList(user: string, loa: number | string) {
    //获取主列表
    let list: Lists[] = await dtLists(user, loa);

    //获取评论信息
    let comment: Comtent[] = formatComment(await dtComment());
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
    let keywords = await sqlGetDtIndexAll();
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
            let key = process.env.miKey
            data[i].text = mi.jie(data[i].text.slice(5), key);
        }
    }
    return data;
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

//添加图片
export async function setImg(id: number, imgArr: string[], imgSrc: string, headNum?: number) {
    let falg = true;
    if (!headNum) {
        headNum = 0;
    }

    for (let i = headNum; i < imgArr.length; i++) {
        let a = await setImgDt(id, i, imgArr[i]);
        if (!a) {
            return false
        }
    }
    return true;
}

//添加视频
export async function setVideo(id: number, videoArr: string[], headNum?: number) {
    let falg = true;
    if (!headNum) {
        headNum = 0;
    }
    for (let i = headNum; i < videoArr.length; i++) {
        let a = await setDtVideo(id, i, videoArr[i]);
        if (!a) {
            return false
        }

    }
    return true;
}
//查询动态id值
export async function getIdMax() {
    let ids = await dbSql<{ id: string }[]>('SELECT MAX(id) as id FROM dt;');
    return ids[0].id;
}



export async function setDtComB(comId: number, imgNameArr: string[]) {
    let img_index = 0;
    let sql = "INSERT INTO dt_comments_img (comment_id, img_index, img_src, img_name) VALUES (?,?,?,?)";
    for (let i = 0; i < imgNameArr.length; i++) {
        let a = await dbSql(sql, [comId, img_index, 'dtimg', imgNameArr[i]], true);
        if (a == 1) {
            img_index++;
        } else {
            return false
        }
    }
    return true;

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

//从动态主表中查询图片权限信息
export async function dtidS(dtid: string) {
    let sql = `SELECT user,loa,shows FROM dt where id = ?`;
    let res = await dbSql<{ user: string, loa: number, shoes: number }[]>(sql, [dtid]);
    return res;
}




//添加标签
export async function setdtindex(id: number, keyword: string, isAi: number) {
    //判断keyworld表中是否已存在
    let falg = await iskeywords(id, keyword);
    if (falg) {
        return true
    }
    falg = await setKeyword(id, keyword, isAi);
    return falg;
}


export async function dtDate(year: number | string) {
    let sql = `SELECT date FROM dt WHERE YEAR(date) = ${year}`;
    let results = await dbSql<{ date: string }[]>(sql);
    let a = [];
    for (let i = 0; i < results.length; i++) {
        a[i] = JSON.stringify(results[i].date).split('T')[0].split('"')[1].split('-').join(',')
    }
    return a;
}


//添加主数据
export async function setDt(id: string, user: string, text: string, img_show_num: string, img_all_num: string, video_num: string,
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


export async function setDtCom(date: string, content: string, dtId: string, user: string, imgNum?: number) {

    imgNum = imgNum || 0;
    let sql = "INSERT INTO dt_comments (date, content, dtId, user,img_all_num,loa) VALUES (?,?,?,?,?,1)";
    let canshuArr = [date, content, dtId, user, imgNum];
    let a = await dbSql(sql, canshuArr, true);
    if (a == 1) {
        return { tf: 1 };
    }
    return { tf: 0 };

}

/**
 * 删除指定动态
 * @param dtId 
 * @returns 
 */
export async function delDt(dtId: number) {
    let a = await delDtData(Number(dtId))
    if (a) {
        return { tf: 1 }
    }
    return { tf: 0 }
}



/**
 * 查询单个动态的数据
 * @param user 
 * @param id 
 * @param loa 
 * @returns 
 */
export async function getdts(user: string, id: number, loa: number) {
    let data: Lists[] = await dtLists(user, loa, id) as Lists[];
    if (data.length == 0) {
        return null;
    }
    let list: Lists = data[0];

    let dtCommnetData = await dtComment(id);
    //评论
    let comment: Comtent[] = formatComment(dtCommnetData);

    list.com = comment;

    //标签
    let keyword = await sqlGetDtIndex(id);
    list.keyword = keyword;

    return list;
}







//获取视频的地址
export async function getVideoSrc(dtid: number, index: number) {
    let videoSrc = await getDtVideoFile(dtid, index);
    if (!videoSrc || videoSrc.length == 0) {
        return false
    }
    return videoSrc[0];
}