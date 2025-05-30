import { chinese_English } from "@/tool/chineseTrEnglish";
import { Comtent, Lists } from "@/type";
import { setKeyword, sqlGetDtIndex } from "./queries";
import {  dtLists } from "./dt";

//找动态中的评论
export function findCom(list: Lists, comment: Comtent[]) {
    let id = list.id;
    let a = comment.filter(obj => obj.dtId == id);
    return a;
}

// 加密评论
export function jiamiConmit(Comtent: Comtent[], loa: number | string) {
    if (Number(loa) == 0) {
        for (let i = 0; i < Comtent.length; i++) {
            if (Comtent[i].loa != 0) {
                Comtent[i].content = chinese_English(Comtent[i].content);
            }
        }
    }
}





//判断标签是否存在
export async function iskeywords(id: number, keyword: string) {
    let arr = await sqlGetDtIndex(id);
    for (let e of arr) {
        if (e.keyword == keyword) {
            return true
        }
    }
    return false;
}




export function splitContent(content: string) {
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


/***
 * @param list - 主列表
 * @param obj - 需要挂载的小列表
 * @param name - 主列表中挂载的属性名
 * @param dataName - 列表属性
 * @param delName - 需要覆盖的字段
 * @param cb - 自定义添加规则，
 */
export function fusionObj(list: Lists[], obj: any[], name: string, dataName?: string, delName?: string, cb?: (list: Lists, obj: any) => void) {
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

type commentData = ({
    userInfo: {
        id: number;
        name: string;
        user: string;
        touxian: string;
    };
} & {
    dtId: number;
    id: number;
    date: Date;
    content: string;
    img_all_num: number;
    user: string;
    shoes: number;
    loa: number;
})[]

/**
 * mysql查询出的评论数据转结构化
 */
export function formatComment(dtComment: commentData) {
    let comment: Comtent[] = [];
    for (let a of dtComment) {
        comment.push({
            id: a.id,
            dtId: a.dtId,
            date: a.date.toString(),
            content: a.content,
            imgAllNum: a.img_all_num,
            name: a.userInfo.name,
            loa: a.loa,
            user: a.userInfo.user
        });
    }
    return comment;

}
