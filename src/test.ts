// import { getKeepBadmintonList } from "./models/dt";
// import { getUrl } from "./pathUtils";
import { envStart } from './utils/env';
import { upData } from "./services/dtList";
import { prisma } from './config/prisma';
import { formatString, mvFileName } from './utils/time';
import { getUrl } from './pathUtils';
import fs from 'fs';
import { isDtExist } from './models/dt/dt';
import moment from 'moment';
import { getLoaDate, setLoaDate } from './services/loaDate';
import { dbSql } from './utils/dbSql';
import { md5Text } from './utils/cryptoUtils';
import e from 'express';
import path from 'path';
// import { addDB, processImage } from "./services/imgdataArr";
// import { vectorAdd } from "./services/vector";
// import { dbSql } from "./utils/dbSql";
// envStart;
// getKeepBadmintonList()
//     .then((data)=>{
//         console.log(data);
//     })

// 调用函数并传入图片路径

// async function main(){
//     let data = await processImage(getUrl('assets','test.png'));
//     await addDB(data.blackArr,data.redArr);
//     console.log("ok");

// }

// main();

// vectorAdd();
// async function fn(){

//     let a = await  upData('yw',0,0);
//     console.log(a);
// }

// fn();


// async function a(){
//     let data = await dbSql<{id:number,img_name:string}[]>('SELECT * FROM `dt_img` WHERE id BETWEEN 2330 AND 2421;')
//     for(let a of data){
//         let str = a.img_name.split('/')[2];
//         console.log(a.img_name,str);

//         let c = await dbSql("UPDATE dt_img SET img_name = ? WHERE dt_img.id = ?;",[str,a.id]);
//     }
// }

// a();

//将时间存入mysql
// async  function setdate(){
//     let dateArr:string[] = fs.readFileSync('/dream/HelixCore/src/ahda1.txt', 'utf8').split('\n');
//     dateArr = dateArr.filter(item => item.trim() !== '');
//     let dateArr1:Date[] = [];
//     for(let i = 0; i < dateArr.length; i++){
//         let d = moment(dateArr[i], 'YYYY-MM-DD HH:mm','Asia/Shanghai').toDate();
//         dateArr1.push( new Date(d.getTime() + 8 * 3600 * 1000) )

//     }

//     await prisma.dt_date.createMany({
//         data:dateArr1.map((item,index) => ({
//             date:item,
//         }))
//     })



// }


async function jisuan() {

}


async function dyBack() {
    let dtIndexArr = await prisma.dt_index.findMany({
        where: {
            keyword: "抖音"
        }
    });
    let dtIdArr = new Set<number>();
    for (let a of dtIndexArr) {
        dtIdArr.add(a.dt_id);
    }

    for (let a of dtIdArr) {

        // 先查询记录是否存在
        const existingRecord = await prisma.dt.findUnique({
            where: { id: a } // 假设 a 是你要更新的记录ID
        });

        if (existingRecord) {
            // 记录存在才执行更新
            await prisma.dt.update({
                where: { id: a },
                data: {
                    save: true,
                }
            });
        } else {
            console.log(a + '不存在');

        }
    }
}


// let sql = `SELECT id, req_headers FROM dream_req_log`;
// let list = await dbSql<{ id: number, req_headers: string }[]>(sql, [], false, 'log');
// for (let item of list) {
//     let text = item.req_headers;
//     let md5 = md5Text(text);
//     let sql = `INSERT IGNORE INTO res_has (md5, data) VALUES (?, ?);`;
//     await dbSql(sql, [md5, text], true, 'log');
//     sql = `UPDATE dream_req_log SET req_headers = ? WHERE id = ?;`;
//     await dbSql(sql, [md5, item.id], true, 'log');
//     console.log(item.id);
// }




async function getNode(id: string) {
    let list = await dbSql<{ id: string, parent_id: string }[]>('SELECT id,parent_id FROM node where id = ?', [id], undefined, 'chat');
    return list[0];
}

let titleSet = new Set<string>();


async function main() {

    // let arr = await dbSql<{ root_id: string }[]>('SELECT root_node FROM `list`', [], undefined, 'chat');
    // for (let a of arr) {
    //     titleSet.add(a.root_id);
    // }
    // let rootId = 'eaa812f8-53ad-4377-a5e6-5475eca5b450';
    // while (true) {
    //     let a = (await getNode(rootId));
    //     if (!a) {
    //         console.log('error');
    //         return
    //     }
    //     let id = a.parent_id;
    //     if (titleSet.has(id)) {
    //         console.log(id);
    //         return
    //     } else {
    //         rootId = id;
    //         console.log(id);

    //     }
    // }

    // let sql = 'SELECT video_name FROM dt_video';
    // let videoList = await dbSql<{ video_name: string }[]>(sql, []);
    // let videoPath = '/dream/HelixCore/assets/a/2024/video/original/';
    // let videoPath1 = '/dream/HelixCore/assets/a/2025/video/original/';


    // let fileSet = new Set([...getFilesSet(videoPath), ...getFilesSet(videoPath1)]);

    // for (let a of videoList) {
    //     let name = a.video_name;
    //     if (!fileSet.has(name)) {
    //         console.log(name);
    //     }
    // }
    let sql = 'SELECT img_name FROM dt_img';
    let videoList = await dbSql<{ img_name: string }[]>(sql, []);
    let videoPath = '/dream/HelixCore/assets/a/2024/img/original';
    let videoPath1 = '/dream/HelixCore/assets/a/2025/img/original';


    let fileSet = new Set([...getFilesSet(videoPath), ...getFilesSet(videoPath1)]);

    for (let a of videoList) {
        let name = a.img_name;
        if (!fileSet.has(name) && name != 'null') {
            console.log(name);
        }
    }














    console.log(0);
    process.exit(0);







}

function getFilesSet(dir: string) {
    const files = fs.readdirSync(dir);  // 获取目录下的所有文件/文件夹
    const fileSet = new Set();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) { // 只保留文件
            fileSet.add(file);
        }
    });

    return fileSet;
}

// main();


async function main1() {
    // console.log(1);
    // let arr:string[] = [];
    // let sql = "SELECT content FROM node where author = 'user'"
    // let a = await dbSql<{content:string}[]>(sql,[],false,'chat');
    // for(let b of a ){
    //     arr.push(b.content);
    // }
    // fs.writeFileSync('/dev/shm/chat.json',JSON.stringify(arr));
    // console.log('1');
    let arr = JSON.parse(fs.readFileSync('/dev/shm/chat.json').toString()) as string[];
    console.log(arr.length);

    // console.log(findMostCommonPrefix(arr));

    process.exit(0);

}

function findMostCommonPrefix(lines: string[], maxPrefixLength = 20) {
    const freq = new Map();

    for (const line of lines) {
        // 去掉前后空白
        const text = line.trim();
        if (!text) continue;

        // 生成前缀
        for (let len = 1; len <= Math.min(maxPrefixLength, text.length); len++) {
            const prefix = text.slice(0, len);
            freq.set(prefix, (freq.get(prefix) || 0) + 1);
        }
    }

    // 找出最高频的前缀
    let maxPrefix = "";
    let maxCount = 0;

    for (const [prefix, count] of freq) {
        if (count > maxCount || (count === maxCount && prefix.length > maxPrefix.length)) {
            maxPrefix = prefix;
            maxCount = count;
        }
    }

    return { prefix: maxPrefix, count: maxCount };
}


// main1();
import util from "util";
import child_process from "child_process";

const exec = util.promisify(child_process.exec);

async function main2() {

    await cleanupCompressedVideos();

    process.exit(0);
}



const ORIGINAL_DIR = "/dream/HelixCore/assets/a/2024/video/original";
const COMPRESSED_DIR = "/dream/HelixCore/assets/a/2024/video/compressed";

// main2();

/**
 * 使用 ffprobe 判断视频是否为 H.264 编码
 */
async function isH264(videoPath: string): Promise<boolean> {
    try {
        const { stdout } = await exec(
            `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "${videoPath}"`
        );

        const codec = stdout.trim();
        return codec === "h264";
    } catch (err) {
        console.error("ffprobe error:", err);
        return false;
    }
}

/**
 * 遍历 original 目录，
 * 如果视频本来就是 H.264，则删除 compressed 中对应文件
 */
export async function cleanupCompressedVideos() {
    const files = fs.readdirSync(ORIGINAL_DIR);

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (![".mp4", ".mov", ".mkv", ".avi"].includes(ext)) {
            console.log(`跳过非视频文件: ${file}`);
            continue;
        }

        const originalPath = path.join(ORIGINAL_DIR, file);
        const compressedPath = path.join(COMPRESSED_DIR, file);

        console.log(`检查视频: ${file}`);

        const h264 = await isH264(originalPath);

        if (h264) {
            console.log(`✔ 是 H.264 视频: ${file}`);

            if (fs.existsSync(compressedPath)) {
                fs.unlinkSync(compressedPath);
                console.log(`🗑 删除 compressed 中多余文件: ${file}`);
            } else {
                console.log(`compressed 中无同名文件，无需删除`);
            }
        } else {
            console.log(`✖ 不是 H.264，跳过: ${file}`);
        }
    }

    console.log("处理完成");
}



// let aDir = '/dream/HelixCore/assets/a/2024/img/original/';
// let bDir = '/dream/HelixCore/assets/recycle';
// async function main3() {
//     let sql = "SELECT img_src,img_name FROM `dt_img`";
//     let imgList = await dbSql<{ img_src: string, img_name: string }[]>(sql, []);
//     //遍历aDir目录下的文件，判断文件是否在imgList中存在,如果不存在，将文件移动到bdir目录下
//     let files = fs.readdirSync(aDir);
//     let imgNameSet = new Set<string>();
//     for (let a of imgList) {
//         if (a.img_src == '2024') {
//             imgNameSet.add(a.img_name);
//         }

//     }
//     for (let file of files) {
//         if (!imgNameSet.has(file)) {
//             //移动文件
//             fs.renameSync(aDir + file, bDir + '/' + file);
//             console.log('移动文件：' + file);
//         }
//     }


// }

let aDir = '/dream/HelixCore/assets/a/2024/video/original/';
let bDir = '/dream/HelixCore/assets/recycle';
async function main3() {
    let sql = "SELECT img_src,img_name FROM `dt_img`";
    let imgList = await dbSql<{ img_src: string, img_name: string }[]>(sql, []);
    //遍历aDir目录下的文件，判断文件是否在imgList中存在,如果不存在，将文件移动到bdir目录下
    let files = fs.readdirSync(aDir);
    let imgNameSet = new Set<string>();
    for (let a of imgList) {
        if (a.img_src == '2024') {
            imgNameSet.add(a.img_name);
        }

    }
    for (let file of files) {
        if (!imgNameSet.has(file)) {
            //移动文件
            fs.renameSync(aDir + file, bDir + '/' + file);
            console.log('移动文件：' + file);
        }
    }


}

// main4();