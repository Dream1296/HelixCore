const db = require('../config/db/mysql');
import path, { resolve } from 'path';
import fs from 'fs';
import zlib from 'zlib';
const m3s = require('../utils/audios.js');
import { aus } from '../utils/setAu';
import { getUrl } from '@/pathUtils';


type A = {
    id: string,
    time_head: number,
    time_end: number,
    text: string,
}

export function getData(bookId: string) {
    // let paths = path.join(__dirname, `bookData/dataJson`);
    let filePath = path.join(getUrl('assets'), `bookData/dataJson/${bookId}.json`);
    // if(israr == '1'){
    //     let filePath = path.join(__dirname, `bookData/dataJson/${bookId}.json.gz`);
    //     if( fileIsDir(paths,filePath)){
    //         return JSON.parse(fs.readFileSync(filePath).toString());
    //     }else{

    //     }
    // }
    let data = JSON.parse(fs.readFileSync(filePath).toString());
    return data;
}

export function bookRDatas(bookId: string) {
    return new Promise((resolve, rejects) => {
        let paths = path.join( getUrl( 'assets'), `bookData/dataJson`);
        let filePath = path.join( getUrl( 'assets'), `bookData/dataJson/${bookId}.json.gz`);
        let jsonPath = path.join( getUrl( 'assets'), `bookData/dataJson/${bookId}.json`);
        if (fileIsDir(paths, filePath)) {
            resolve(filePath);
        }
        let data = fs.readFileSync(jsonPath);
        zlib.gzip(data, (err, buffer) => {
            if (err) throw err;

            // 将压缩后的数据写入新的文件
            fs.writeFileSync(filePath, buffer);
            resolve(filePath);
        })
    })


}





export function bookVDatas(bookId: string, start: number, end: number, num1: number, num2: number) {
    let datas = getData(bookId);
    let vData = dataVdata(datas, num1, num2);


    return vData.slice(start, end);
}

const times = 1000;

export async function getAu(bookId: string, id: number | string) {
    let datas = await getData(bookId);
    const data = datas.find((obj: A) => obj.id == id) as A;
    let start = data.time_head;
    let end = data.time_end;


    console.log(start,end);
    
    if (start == -1 || end == -1) {
        let outPath = path.join(getUrl('assets'), 'bookData/audios');
        let fileName = `${bookId}-${id}.mp3`;
        let pathFile = path.join(outPath, fileName);
        
        if (fileIsDir(outPath, fileName)) {
            setAuduilie(bookId, id.toString(), pathFile, 5, outPath);
            return pathFile;
        }

        // //查询是否有任务，并等待任务完成
        // let isrw = await getAuduilie(fileName);
        // if (isrw) {
        //     await new Promise(resolve => setTimeout(resolve, 500));
        //     setAuduilie(bookId,id.toString(),pathFile,5,outPath);
        //     return pathFile;
        // }


        let a = await aus(data.text, pathFile, 1);
        if (a == 'OK') {
            // 等待1秒  
            setAuduilie(bookId, id.toString(), pathFile, 5, outPath);
            await new Promise(resolve => setTimeout(resolve, times));
            return pathFile;
        }
    }

    let outPath = path.join(getUrl('assets'), 'bookData/frap');
    let fileName = `${bookId}-${id}.mp3`;
    let pathFile: string;


    console.log(outPath,fileName);
    
    if (fileIsDir(outPath, fileName)) {
        pathFile = path.join(outPath, fileName);
    } else {
        let path1 = path.join(getUrl('assets'), `bookData/audio/${bookId}.mp3`);
        let path2 = path.join(outPath, fileName);
        pathFile = await m3s(path1, path2, start, end);
    }
    return pathFile;
}

//任务队列
let auduilie: { fileName: string, po: Promise<any> }[] = [];

//获取任务队列中的任务并等待执行
async function getAuduilie(fileName: string) {
    let max = auduilie.length;
    let flag = false;
    for (let i = 0; i < max; i++) {
        if (auduilie[i].fileName == fileName) {
            let po = await auduilie[i].po;
            if (po == 'OK') {
                flag = true;
            }
        }
    }
    return flag;
}



//检查id附近指定距离是否全满，并预加载最近音频
function setAuduilie(bookId: string, id: string, pathFile: string, juli: number, outPath: string) {
    let ids = Number(id);
    let fileName = `${bookId}-${id}.mp3`;
    //查队列中的任务
    const findAu = (fileName: string) => {
        let max = auduilie.length;
        let flag = false;
        for (let i = 0; i < max; i++) {
            if (auduilie[i].fileName == fileName) {
                flag = true;
            }
        }
        return flag;
    }
    while (ids - Number(id) > juli) {
        if (!fileIsDir(outPath, fileName) && !findAu(pathFile)) {
            auss(bookId, id, pathFile);
            return
        }
        ids++;
    }

}


//预加载在线音频
async function auss(bookId: string, id: string, pathFile: string) {
    let datas = await getData(bookId);
    const data = datas.find((obj: A) => obj.id == id) as A;
    let po = aus(data.text, pathFile, 1);
    auduilie.push({
        fileName: `${bookId}-${id}.mp3`,
        po: po,
    })
}

export function getBookList() {
    return JSON.parse(fs.readFileSync(path.join(getUrl('assets'), 'bookData/bookList.json')).toString());
}

export function bookCovers(bookid: string) {
    let fileDir = path.join(getUrl('assets'), `bookData/cover`);
    let fileName = bookid + '.png';
    if (fileIsDir(fileDir, fileName)) {
        return path.join(fileDir, fileName);
    } else {
        return path.join(fileDir, 'default.png');
    }

}



export function getBookJd(bookId: string) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT jdID FROM bookjd WHERE bookId = ?';
        db.query(sql, bookId, (err: any, results: any) => {
            if (err) {
                reject('0')
            }
            if (results.length > 0) {
                resolve(results[0].jdID);
            }
            reject(results);
        })
    })
}

export function setBookJd(bookId: string, jd: string) {
    return new Promise((resolve, reject) => {
        const sql = 'update bookjd set jdID = ? WHERE bookId = ?';
        db.query(sql, [jd, bookId], (err: any, results: any) => {
            if (err) {
                reject('0')
            }
            if (results.affectedRows == 1) {
                resolve('OK');
            }
        })
    })
}

//判断某个目录中是否包含某个文件
function fileIsDir(dir: string, file: string) {
    try {
        // 读取目录中的所有文件和文件夹  
        const files = fs.readdirSync(dir);
        // 检查目标文件是否在目录中  
        return files.includes(file);
    } catch (err) {
        console.error("无法读取目录", err);
        return false;
    }
}

function dataVdata(datac: any, num1: number, num2: number) {
    let vdata: any[] = [];
    let vId = 0;
    datac.forEach((e: any) => {
        vdata.push(...d(e));
    });
    return vdata

    //段落分割为句子
    function d(data: any) {
        let datas = [];
        let curr = 0;
        let h = " ";
        let all = data.text.length;
        datas.push({
            id: vId++,
            text: " ",
            id_up: data.id,
        });
        if (all <= num1) {
            datas.push({
                id: vId++,
                text: " ",
                id_up: data.id,
            });
            datas.push({
                id: vId++,
                text: h + data.text,
                id_up: data.id,
            });
            return datas;
        }
        curr += num1;
        datas.push({
            id: vId++,
            text: h + data.text.slice(0, curr),
            id_up: data.id,
        });
        all -= num1;
        while (true) {
            if (all <= num2) {
                curr += all;
                datas.push({
                    id: vId++,
                    text: data.text.slice(curr - all, curr),
                    id_up: data.id,
                });
                return datas;
            }
            curr += num2;

            datas.push({
                id: vId++,
                text: data.text.slice(curr - num2, curr),
                id_up: data.id,
            });
            all -= num2;
        }
    }

}
