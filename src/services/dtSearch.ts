import { dtList } from "../models/dt";
import { setWorld } from "./worlds";
import { Comtent,  Lists } from "../type";
import { dbSql } from "@/utils/dbSql";
const db = require('../config/db/mysql');



// setWorld()
export async function dtFind(word: string) {
    let List = await dtList('yw', 1);
    let idArr: { id: string, num: number }[] = [];

    //预计算所有标签与搜索词相识度
    let bqArr: Set<string> = new Set();
    for (let dt of List) {
        if (dt.keyword) {
            for (let bq of dt.keyword) {
                bqArr.add(bq.keyword);
            }
        }
    }
    await getw(bqArr, word);


    for (let dt of List) {
        let num = await worldNum(word, dt);
        idArr.push({ id: dt.id, num });
    }
    //排序
    idArr.sort((a, b) => b.num - a.num);
    return idArr;
}

//简单搜索
export async function dtFinds(word: string,user:string | undefined,loa:number) {
    let List;

    if(user){
        List = await dtList(user, loa);
    }else{
        List = await dtList('yw',0);
    }
    
    let idArr: { id: string, num: number }[] = [];
    
    let sql = `SELECT dt_id,text FROM dt_img`;
    let imgText = await dbSql<{dt_id:number,text:string}[]>(sql);


    for (let dt of List) {
        let num = 0;
        if (dt.text.includes(word)) {
            num += 100;
        }
        if (dt.keyword) {
            for (let bq of dt.keyword) {
                if (bq.keyword == word || bq.keyword.includes(word) || word.includes(bq.keyword)) {
                    num += 100;
                }
            }
        }
        

        if (num > 0) {
            idArr.push({ id: dt.id, num });
        }
    }

    for(let a of imgText){
        let num = 0;
        if(a.text &&  a.text.includes(word)){
            num += 100;
        }
        if (num > 0) {
            idArr.push({ id: a.dt_id.toString(), num });
        }
    }

    //排序
    idArr.sort((a, b) => b.num - a.num);
    return idArr;
}



async function worldNum(word: string, dt: Lists) {
    let num = 0;
    //正文命中
    if (dt.text.includes(word)) {
        num = 100;
    }

    //如果正文没有命中，进行标签对比
    if (!num) {
        //标签相识度比较
        num += await bqbj(dt.keyword, word);
    }

    return num;


}
//标签匹配度计算
async function bqbj(dtBq: { keyword: string; isAi: number; }[] | undefined, word: string) {
    if (!dtBq) {
        return 0;
    }
    let numArr: number[] = [];
    for (let bd of dtBq) {
        let a = await bdbjs(bd.keyword, word);
        if (bd.isAi) {
            let num = Math.floor(a * 80);
            numArr.push(num);
        }
        if (!bd.isAi) {
            let num = Math.floor(a * 100);
            numArr.push(num);
        }
    }
    return Math.max(...numArr);

}
//词义比较
async function bdbjs(word1: string, word2: string) {
    let score = await getWord(word1, word2);
    if (score == -1) {
        score = (await setWorld(word1, word2)).score;
        await setWord(word1, word2, score);
    }
    return score;
}

async function getWord(word1: string, word2: string): Promise<number> {
    return new Promise((resolve, rejects) => {
        let sqlStr = 'SELECT * FROM word_compare WHERE text_1 = ? AND text_2 = ?';
        db.query(sqlStr, [word1, word2], (error: any, results: { text_1: string, text_2: string, score: number }[]) => {
            if (error) {
                rejects(-1)
            }
            if (results.length == 0) {
                resolve(-1);
            }
            if (results.length > 0) {
                resolve(results[0].score);
            }
        })
    })
}

async function setWord(word1: string, word2: string, score: number): Promise<boolean> {
    return new Promise((resolve, rejects) => {
        let sqlStr = 'INSERT INTO word_compare (id, text_1, text_2, score) VALUES (NULL, ?, ?, ?);';
        db.query(sqlStr, [word1, word2, score], (error: any, results: any) => {
            if (error) {
                return resolve(false);
            }
            if (results.affectedRows == 1) {
                return resolve(true);
            }
        })
    })
}

function getw(wArr: Set<string>, word: string) {
    return new Promise(async (resolve, reject) => {
        let wordArr = Array.from(wArr); // 将 Set 转换为数组

        // 限制最大并发量的异步处理函数
        async function processWord() {
            let w1 = wordArr.pop();
            if (w1) {
                let score = await getWord(w1, word);
                if (score == -1) {
                    score = (await setWorld(w1, word)).score;
                    await setWord(w1, word, score);
                }

                await processWord(); // 递归调用以处理下一个元素
            }
        }

        // 创建并发任务
        let promises = [];
        for (let i = 0; i < 20; i++) {
            if (wordArr.length > 0) {
                promises.push(processWord());
            }
        }

        // 等待所有并发任务完成
        await Promise.all(promises);
        console.log('======================');

        resolve('');
    });
}





