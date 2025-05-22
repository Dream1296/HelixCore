import { getUrl } from "@/pathUtils";
import { dbSql } from "@/utils/dbSql";
import Tesseract from "tesseract.js";
import fs from 'fs';
import { fork } from 'child_process';

//需要处理的图片信息
let imgSrcArr: { src: string, id: string ,text:string}[] = [];
//当前处理的结果
let upDatas: { id: string, text: string };

main();

async function main() {
    await setText();
    for (let data of imgSrcArr) {
        if(data.text != undefined){
            continue;
        }
        console.log(data.id + ' / ' + imgSrcArr.length);
        let falg = await cl(data);
        if (falg) {
            await updataDB(upDatas.id, upDatas.text);
        }
    }
}

//查询所有图片路径
async function setText() {
    let data = await dbSql<{ id: number, img_src: string, text: string }[]>('SELECT * FROM `dt_img`');
    for (let obj of data) {
        if (obj.text) {
            continue;
        }
        let src = getUrl('assets', obj.img_src);
        if (!fs.existsSync(src)) {
            continue;
        }
        imgSrcArr.push({ src: src, id: obj.id.toString(),text:obj.text });
    }
}


//将图片信息发给b.ts，返回是否成功，并写入upDatas中。
function cl(data: {
    src: string;
    id: string;
}) {
    return new Promise((resolve, reject) => {
        // const child = fork('/dream/HelixCore/src/tool/fork/b.js');
        const url = getUrl('root', 'src/tool/fork', 'b.ts');
        const child = fork(url);
        // 120秒超时
        let dsq = setTimeout(() => {
            upDatas = {
                id: data.id,
                text: '0'
            };
            resolve(true);
        }, 120000);
        child.send(data);
        child.on(('message'), (msg: {
            text: string,
            id: string,
        }) => {
            clearTimeout(dsq);
            upDatas = {
                id: msg.id,
                text: msg.text
            };
            child.kill(); // 关闭子进程
            resolve(true);
        })
    })
}

//将数据写入数据库
async function updataDB(id: string, text: string) {
    let sql = `UPDATE dt_img SET text = ? WHERE id = ?;`
    await dbSql(sql, [text, id], true);
}




