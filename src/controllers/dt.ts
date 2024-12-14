import express, { Request, Response } from 'express';
import { dtList, dtDate, setDt, setDtCom, delDt, getdts, setdtindex, getIdMax, setImg, setVideo, getLongVideoList, setDtBgStyle, getRedisListData, setDtM, setShareDb, setUserss, getShareDbToken, dtidS } from '../models/dt';
import { getemojis } from '../models/emoji';
import { List, Reqs } from '../type';
import path, { join } from 'path';
import { imgCompression } from '../utils/img';
import { userWeizhi, SetuserWeizhi } from '../models/weizhi';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import axios from "axios";
const multer = require('multer');
const jiami = require('../utils/usErcrypto.js').jiami;
import fs from 'fs';
import { dtAdd } from '../services/dtAdd';
// import { dtAdd_ah } from '../services/dt_ah';
import { dtFind, dtFinds } from '../services/dtSearch';
import { jiamiString } from '../utils/cryptoUtils';
import { dbSql } from '@/utils/dbSql';
import { getUrl } from '@/pathUtils';
import { Key } from '@/utils/passwd';
import { getDtDataImg } from '@/services/dtDataT';
import { dtDataAdd } from '@/services/dtDataAdd';
import { spawn } from 'child_process';
import { emit } from 'process';
import { myEvent } from '@/services/evenTs';
import { getShareToken } from '@/services/token';



//获取列表信息和评论信息
export async function getDtList(req: Reqs, res: Response) {
    let loa = Number(req.query.loa || "0");
    let aes = Number(req.query.aes || "0");
    let user = (req.user?.username) ? req.user.username : "guest";

    if (req.user?.dtid && req.user.dtid != "-1") {
        user = "guest";
    }

    //从redis中获取主数据
    let listData = await getRedisListData(user, loa, aes);

    //插入其他组件数据
    let datas = await dtDataAdd(listData);


    let resData = {
        code: 200,
        loa: loa,
        aes: aes,
        message: 'Success',
        data: datas,
    };


    return res.send(resData);

}

export async function setDtBgStyles(req: Reqs, res: Response) {
    let dtid = req.body.id;
    let dtStyle = req.body.dtBgStyle;
    let a = await setDtBgStyle(dtid, dtStyle);
    if (a) {
        return res.send({ tf: 1 });
    } else {
        return res.send({ tf: 0 });
    }
}


export async function getdt(req: Reqs, res: Response) {
    const dtid = req.query.id;
    const loa = req.query.loa || 0;
    let user = req.user?.username || 'guest';

    if (!dtid || dtid == '-1') {
        return res.status(400).send({ code: 400 ,msg:"参数不全"});
    }

    if (req.user?.dtid != dtid.toString() && req.user?.dtid != "-1") {
        user = "guest";
    }

    let dtT = await dtidS(dtid.toString());
    if (dtT.length != 1) {
        return res.status(400).send({
            code: 400,
            msg:"查询动态不存在"
        })
    }

    let resc = await getdts(user, Number(dtid), dtT[0].loa);

    if (!resc) {
        return res.status(400).send({
            code: 400,
            msg:"查询为空"
        })
    }
    if(dtT[0].loa != 0 && dtT[0].loa != loa){
        return res.status(400).send({
            code:400,
            msg:"未正确指定分级"
        })
    }
    res.send({
        code: 200,
        data: resc,
    })
}

export async function dtfinds(req: Reqs, res: Response) {
    let date = +new Date();
    const bq = req.query.bq;
    const loa = req.query.loa || 0;
    const user = req.user?.username || "guest";
    //是否为标签
    const isBq = req.query.isbq;
    let numArr;
    if (!bq) {
        return res.send({ code: 400 });
    }
    if (!Number(isBq)) {
        //简单搜索
        numArr = await dtFinds(bq as string, req.user?.username);
    }
    else {
        numArr = await dtFind(bq as string);
    }

    let List = await dtList(user, Number(loa));
    let newList = [];
    for (let id of numArr) {
        newList.push({
            type: "A",
            ...finds(id.id),
            score: id.num,
        })
    }
    let time = -(date - (+new Date())) / 1000;
    return res.send({ code: 200, time, data: newList, });

    function finds(id: string) {
        for (let dt of List) {
            if (dt.id == id) {
                return dt
            }
        }
    }



}

export async function dtindex(req: Reqs, res: Response) {
    const dtid = req.body.id;
    const dtindex = req.body.dtindex;
    if (!dtid || !dtindex) {
        return res.send({
            code: 400,
        })

    }
    let falg = await setdtindex(Number(dtid), dtindex.toString(), 0);
    if (falg) {
        return res.send({ tf: 1 })
    } else {
        return res.send({ tf: 0 })
    }
}

export async function postCom(req: Reqs, res: Response) {
    if (!req.user?.username) {
        return res.send({
            code: 400,
        })
    }
    const user = req.user.username;
    const content = req.body.content;
    const dtId = req.body.dtId;
    const date = getnowDate();
    const a: any = await setDtCom(date, content, dtId, user);
    if (a.tf == 1) {
        res.send({ tf: 1 });
    }
}
//获取当前时间
function getnowDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的  
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 拼接成 MySQL DATETIME 格式  
    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return dateTimeString;
}

//获取时间信息
export async function dtDates(req: Request, res: Response) {
    let year = req.query.year || 2024;
    const data = await dtDate(Number(year));
    res.send(data);
}

export async function dtDataImg(req: Reqs, res: Response) {
    let year = req.query.year || 2024;
    let title = '动态提交历史';
    const data = await dtDate(Number(year));
    let buffer = getDtDataImg(title, data);
    res.setHeader('Content-Type', 'image/jpg');
    res.send(buffer);
}

//获取缩略图
export async function dtimg(req: Reqs, res: Response) {
    let Reqdtid = req.query.dtid;
    let Reqindex = req.query.index;
    let isImg = req.query.a;

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402, msg: "参数不全" });
    }

    let userT = await dtidS(dtid.toString());
    if (userT.length != 1) {
        return res.send({ code: 402, smg: "id不存在" });
    }

    let tf = hasAccess(req.user?.username, req.user?.dtid, dtid.toString(), userT[0]);
    // console.log(userT[0].loa);

    if (!tf) {
        return res.send({ code: 402 });
    }


    let imgSrc = await dbSql<any>(`SELECT img_src FROM dt_img WHERE dt_id = ${dtid} AND img_index = ${index};`);

    let filename = imgSrc[0].img_src;

    let urls = path.join(getUrl('root', 'assets'));
    let filePath = path.join(urls, filename);

    if (!fileIsDir(urls + '/dtimg', filename.slice(8))) {
        filePath = path.join(urls, './dtimg/imgError.png')
    }

    if (isImg == '0' || !isImg) {
        try {
            // 使用 sharp 来压缩图片
            const data = await imgCompression(filePath, 460, 460);

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': data.length
            });
            res.end(data);
        } catch {
            // 使用 sharp 来压缩图片
            const data = await imgCompression(path.join(urls, './dtimg/imgError.png'), 460, 460);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': data.length
            });
            return res.end(data);
        }
    } else {
        res.sendFile(filePath);
    }

}


function hasAccess(username?: string, userDtID?: string, dtid?: string, userT?: {
    user: string;
    loa: number;
    shoes: number;
},) {
    //如果访问的是已经删除的动态
    if (userT?.shoes == 1) {
        return false;
    }
    //如果访问的公开动态
    if (userT && userT.loa != undefined && userT.loa == 0) {
        return true;
    }
    //如果是登录后访问
    if (username == userT?.user && userDtID == "-1") {
        return true;
    }
    //如果是通过分享链接访问
    if (username == userT?.user && userDtID == dtid) {
        return true;
    }
}

//获取原图
export async function dtimgs(req: Request, res: Response) {
    // let filename = req.query.name as string;
    // let urls = path.join(__dirname, "../../img");
    // let filePath = path.join(urls, filename);
    // res.sendFile(filePath);
}


//获取视频的地址
async function getVideoSrc(dtid: number, index: number) {
    let videoSrc = await dbSql<any>(`SELECT video_src FROM dt_video WHERE dt_id = ${dtid} AND video_index = ${index};`);
    
        if (videoSrc.length == 0) {
            return
        }
    //视频路径（包含文件名）
    let fileSrc = path.join(getUrl('root', 'assets'), videoSrc[0].video_src);

    //文件名
    let fileName = videoSrc[0].video_src.split('/').pop();

    //预览图名
    let fileImgName = fileName.slice(0, -4) + '.png';
    let temp = fileSrc.split('/');
    temp.pop();
    // 不包含文件名的路径
    let fileUrl = temp.join('/');

    return {
        fileSrc,
        fileName,
        fileImgName,
        fileUrl
    }
}

// let videoArr:string[] = [];
let videoSet = new Set<string>([]);

//视频
export async function dtvideo(req: Request, res: Response) {

    let Reqdtid = req.query.dtid;
    let Reqindex = req.query.index;
    let token = req.query.token;

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402 });
    }


    let file = await getVideoSrc(dtid, index);
    if(file == undefined){
        return res.send({ code: 402 });
    }

    file.fileSrc = ensureVideoIsMP4(file.fileSrc);



    const stat = fs.statSync(file.fileSrc);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = (end - start) + 1;
        const audioStream = fs.createReadStream(file.fileSrc, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        audioStream.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(file.fileSrc).pipe(res);
    }
}



/**
 * 如果转换后的MP4文件不存在，进行视频转换并返回转换后的视频路径
 * @param inputPath 原始视频文件路径
 * @returns 转换后的视频文件路径
 */

const ensureVideoIsMP4 = (inputPath: string): string => {
    // 定义输出路径，通过替换 /dtimg/ 为 /dtimgs/ 来构造
    const outputPath = inputPath.replace('/dtvideo/', '/dtvideos/');

    // 检查转换后的文件是否已经存在
    if (fs.existsSync(outputPath)) {
        if (videoSet.has(inputPath)) {
            return inputPath;
        }
        console.log(`转换后的文件已经存在: ${outputPath}`);
        return outputPath;
    }


    console.log(`正在转换视频: ${inputPath} -> ${outputPath}`);



    if (videoSet.size >= 1) {
        return inputPath;
    }

    if (fs.statSync(inputPath).size >= 10 * 1024 * 1024 * 1024) {
        return inputPath;
    }

    videoSet.add(inputPath);

    const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,          // 输入文件路径
        '-c:v', 'libx264',        // 视频编码格式
        '-c:a', 'aac',            // 音频编码格式
        '-strict', 'experimental',// 允许使用实验性音频特性
        '-y',                     // 如果文件已存在，覆盖文件
        outputPath                // 输出文件路径
    ]);

    // 捕获 ffmpeg 的标准错误输出
    ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg输出:', data.toString());
    });

    // ffmpeg 处理完成后的回调
    ffmpeg.on('close', (code) => {
        if (code === 0) {
            console.log(`视频转换成功: ${outputPath}`);
        } else {
            // (new Error(`FFmpeg 进程退出，状态码: ${code}`)); // 转换失败
            console.log('转换失败');

        }
        videoSet.delete(inputPath);
    });

    // 错误处理
    ffmpeg.on('error', (err) => {
        console.log("错误");
        videoSet.delete(inputPath);
    });

    return inputPath;
};


//视频预览图
export async function dtvideoImg(req: Reqs, res: Response) {


    let Reqdtid = req.query.dtid;
    let Reqindex = req.query.index;
    let token = req.query.token;

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402 });
    }



    let file = await getVideoSrc(dtid, index);
    if(file == undefined){
        return res.send({ code: 402 });
    }

    if (fileIsDir(file.fileUrl, file.fileImgName)) {
        return res.sendFile(path.join(file.fileUrl, file.fileImgName));
    }

    // 使用 ffmpeg 生成第一帧作为封面
    ffmpeg(file.fileSrc)
        .screenshots({
            timestamps: ['00:00:01'], // 第1秒
            filename: file.fileImgName, // 保存的文件名
            folder: file.fileUrl, // 保存到的文件夹
            size: '320x240' // 缩略图的尺寸
        })
        .on('end', () => {
            setTimeout(() => {
                return res.sendFile(path.join(file.fileUrl, file.fileImgName)); // 发送封面图片
            }, 300);
        })
        .on('error', (err: Error) => {
            console.error(err);
            res.status(500).send('Error generating thumbnail');
        });
}







// 设置图片存储引擎和文件名
const storage = multer.diskStorage({
    destination: function (req: Request, file: Response, cb: any) {
        cb(null, getUrl('root', 'assets/dtimg_temp')); // 存储的目录，如果不存在会自动创建
    },
    filename: function (req: Request, file: Response, cb: any) {
        cb(null, req.body.filename);
    }
});

//视频存储
const storageVideo = multer.diskStorage({
    destination: function (req: Request, file: Response, cb: any) {
        cb(null, getUrl('root', 'assets/dtvideo_temp')); // 存储的目录，如果不存在会自动创建
    },
    filename: function (req: Request, file: Response, cb: any) {
        cb(null, req.body.filename);
    }
});

// 创建Multer实例
const upload = multer({ storage: storage });

//视频上传中间件
const uploadVideo = multer({ storage: storageVideo });

//导出文件上传中间件
export const uploadSingleFile = upload.single('file');
//导出视频文件上传中间件
export const uploadVideos = uploadVideo.single('file');
//文件上传处理
export async function updt(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).send({ error: '文件上传失败' });
    }
    res.send({ tf: 1 });
}
export async function upvideo(req: Request, res: Response) {
    res.send({
        tf: 1
    });
}

function stopTime(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    })
}

export async function postdt(req: Request, res: Response) {
    let text = req.body.text as string;
    let img = req.body.img as string[];
    let img_show_num = req.body.imgShowNum as string;
    let img_all_num = img.length.toString();
    const date = req.body.date;
    const imgDir = req.body.imgDir as string | undefined;

    const loa = req.body.loa || '0';
    let video = req.body.video as string[];
    let videoNum = video.length.toString();

    if (img_show_num > img_all_num) {
        img_show_num = Number(img_all_num) > 6 ? '6' : img_all_num;
    }

    // 适当的延迟，保证正确写入。
    if (Number(img_all_num) > 0) {
        await stopTime(3000);
    }



    //图片处理
    if (img) {
        let imgArr: string[] = img;

        //判断图片是否包含在上传临时文件夹中
        for (let i = 0; i < imgArr.length; i++) {
            if (!fileIsDir(getUrl('root', 'assets/dtimg_temp'), imgArr[i]) || fileIsDir(getUrl('root', 'assets/dtimg'), imgArr[i])) {
                return res.send({
                    code: 400,
                    error: 1
                })
            }
        }

        //移动图片
        for (let i = 0; i < imgArr.length; i++) {
            const path1 = path.join(getUrl('root', 'assets/dtimg_temp'), imgArr[i]);
            const path2 = path.join(getUrl('root', 'assets/dtimg'), imgArr[i]);
            try {
                fs.renameSync(path1, path2);
            } catch (error) {
                console.log(error);

                return res.send({ code: 500 });
            }
            img[i] = './dtimg/' + imgArr[i];
        }
    }

    if (video.length != 0) {
        for (let i = 0; i < video.length; i++) {
            if (!fileIsDir(getUrl('root', 'assets/dtvideo_temp'), video[i]) || fileIsDir(getUrl('root', 'assets/dtvideo'), video[i])) {
                return res.send({
                    code: 400,
                })
            }

            const path1 = path.join(getUrl('root', 'assets/dtvideo_temp'), video[i]);
            const path2 = path.join(getUrl('root', 'assets/dtvideo'), video[i]);
            try {
                fs.renameSync(path1, path2);
            } catch (error) {
                return res.send({ code: 501 });
            }
            video[i] = './dtvideo/' + video[i];

        }
    }

    //处理图片文件夹
    if (imgDir) {
        let urls = getUrl('root', 'assets', 'dtimgUpTemp');
        let urls2 = getUrl('root', 'assets/dtimg');
        let urls3 = getUrl('root', 'assets/dtvideo');
        let falg = fs.existsSync(urls);
        if (!falg) {
            return res.send({
                code: 400,
                error: 2
            })
        }

        // 生成唯一的时间戳（毫秒级）  
        const uniqueTimestamp = Date.now().toString();
        // 用于生成不重名的文件名  
        let fileCounter = 0;
        const files = fs.readdirSync(urls);
        for (const file of files) {
            const filePath = path.join(urls, file);
            const fileStats = fs.statSync(filePath);
            // 只处理文件，忽略目录  
            if (!fileStats.isFile()) {
                continue;
            }
            const ext = path.extname(file); // 获取文件扩展名  
            if (ext == '.jpg' || ext == '.png' || ext == '.JPG' || ext == '.jpeg') {
                const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
                const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
                const targetFilePath = path.join(urls2, newFileName); // 生成目标文件路径  

                if (fileIsDir(urls2, newFileName)) {
                    return res.send({
                        code: 400,
                        error: 3
                    })
                }
                // 重命名文件  
                fs.renameSync(filePath, newFilePath);

                // 移动文件到目标目录  
                fs.renameSync(newFilePath, targetFilePath);
                img.push('./dtimg/' + newFileName);
                fileCounter++;
            }
            if (ext == '.mp4' || ext == '.avi') {
                const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
                const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
                const targetFilePath = path.join(urls3, newFileName); // 生成目标文件路径  

                if (fileIsDir(urls3, newFileName)) {
                    return res.send({
                        code: 400,
                        error: 4
                    })
                }
                // 重命名文件  
                fs.renameSync(filePath, newFilePath);

                // 移动文件到目标目录  
                fs.renameSync(newFilePath, targetFilePath);
                video.push('./dtvideo/' + newFileName);
                fileCounter++;
            }


        }
    }



    let id = await getIdMax();

    //loa是否为13
    if (loa == 13) {
        text = "^AES^" + jiamiString(text, Key.B13);
    }

    img_all_num = img.length.toString();
    videoNum = video.length.toString();
    const im = setImg(id, img);
    const vi = setVideo(id, video);
    const dt = setDt(id, 'yw', text, img_show_num, img_all_num, videoNum, date, loa);
    Promise.all([im, vi, dt]).then((a) => {
        res.send({ tf: 1 });
    })
}


export function getFile(dtid: number, imgNun: number, videoNum: number) {
    let urls = getUrl('root', 'assets', 'dtimgUpTemp');
    let urls2 = getUrl('root', 'assets/dtimg');
    let urls3 = getUrl('root', 'assets/dtvideo');
    let falg = fs.existsSync(urls);

    let video = [];
    let img = [];

    if (!falg) {
        return console.error(500);

    }

    // 生成唯一的时间戳（毫秒级）  
    const uniqueTimestamp = Date.now().toString();
    // 用于生成不重名的文件名  
    let fileCounter = 0;
    const files = fs.readdirSync(urls);
    for (const file of files) {
        const filePath = path.join(urls, file);
        const fileStats = fs.statSync(filePath);
        // 只处理文件，忽略目录  
        if (!fileStats.isFile()) {
            continue;
        }
        const ext = path.extname(file); // 获取文件扩展名  
        if (ext == '.jpg' || ext == '.png') {
            const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
            const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
            const targetFilePath = path.join(urls2, newFileName); // 生成目标文件路径  

            if (fileIsDir(urls2, newFileName)) {
                return console.error(300);

            }
            // 重命名文件  
            fs.renameSync(filePath, newFilePath);

            // 移动文件到目标目录  
            fs.renameSync(newFilePath, targetFilePath);
            img.push('./dtimg/' + newFileName);
            fileCounter++;
        }
        if (ext == '.mp4') {
            const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
            const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
            const targetFilePath = path.join(urls3, newFileName); // 生成目标文件路径  

            if (fileIsDir(urls3, newFileName)) {
                return console.error(301);
            }
            // 重命名文件  
            fs.renameSync(filePath, newFilePath);

            // 移动文件到目标目录  
            fs.renameSync(newFilePath, targetFilePath);
            video.push('./dtvideo/' + newFileName);
            fileCounter++;
        }


    }

    const im = setImg(dtid.toString(), img, imgNun);
    const vi = setVideo(dtid.toString(), video, videoNum);
}



export async function delDts(req: Request, res: Response) {
    const dtId = req.body.id;
    if (!dtId) {
        return res.send({ tf: 0 });
    }
    const a: any = await delDt(dtId);
    if (a.tf == 1) {
        return res.send({ tf: 1 });
    } else {
        return res.send({ tf: 0 });
    }
}

export function getemoji(req: Request, res: Response) {
    const lei = req.query.lei as string;
    const name = req.query.name as string;
    if (!lei || !name) {
        res.setHeader('Content-Type', 'png/image');
        res.send(getemojis('weixin', '微信.png'))
    }
    res.setHeader('Content-Type', 'png/image');
    res.send(getemojis(lei, name));
}

export function getemojilist(req: Request, res: Response) {
    res.sendFile(getUrl('root', 'public/emoji/list.json'));
}

export async function getweizhi(req: Request, res: Response) {
    let user = req.query.user;
    let jd = req.query.jd;
    let wd = req.query.wd;
    if (!user || !jd || !wd) {
        return res.send({ code: 400 });
    }
    const weizhi = await userWeizhi(user as string) as { jindu: number, weidu: number };
    SetuserWeizhi(user as string, Number(jd), Number(wd));

    const result = calculateDirectionAndDistance(Number(jd), Number(wd), weizhi.jindu, weizhi.weidu);
    res.send({
        code: 200,
        juli: result.distance.toFixed(2),
        xita: result.bearing.toFixed(2)
    });
}

export async function gpsc(req: Request, res: Response) {
    let jindu = req.query.jd;
    let weidu = req.query.wd;
    if (!jindu || !weidu) {
        return res.send({
            code: 400,
        })
    }
    const url = `https://api.map.baidu.com/reverse_geocoding/v3?ak=yXEsQxbvOJpmPR9cenWw9KTj5q9D6c6g&output=json&coordtype=wgs84ll&extensions_poi=0&location=${weidu},${jindu}`;
    const data = await axios.get(url);
    res.send(data.data);
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


function calculateDirectionAndDistance(lon1: number, lat1: number, lon2: number, lat2: number) {
    // 常量
    const R = 6371; // 地球半径（千米）

    // 将经纬度转换为弧度
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const lon2Rad = lon2 * (Math.PI / 180);

    // Haversine 公式计算距离
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 距离（千米）

    // 计算方向
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    let bearing = Math.atan2(y, x) * (180 / Math.PI); // 方向（度）

    // 将方向调整到0到360度之间
    bearing = (bearing + 360) % 360;



    return { distance, bearing };
}

export function lvi(req: Request, res: Response) {
    const src = req.query.src;
    if (!src) {
        return res.send({ code: 400 });
    }
    const videoPath = getUrl('root', 'assets', 'longVideo', src.toString()); // 获取视频文件的路径
    const stat = fs.statSync(videoPath); // 获取文件状态
    const fileSize = stat.size; // 文件大小
    const range = req.headers.range; // 获取请求头中的 Range 信息

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-'); // 解析 Range
        const start = parseInt(parts[0], 10); // 起始字节
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1; // 结束字节

        if (start >= fileSize || end >= fileSize || start > end) {
            res.status(416).send('Requested Range Not Satisfiable'); // 请求的范围不满足
            return;
        }

        const chunkSize = end - start + 1; // 计算分片大小
        const fileStream = fs.createReadStream(videoPath, { start, end }); // 创建文件流
        res.writeHead(206, { // 206 Partial Content
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4', // 设置内容类型
        });
        fileStream.pipe(res); // 将文件流返回给客户端
    } else {
        // 如果没有 Range 头，返回整个文件
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(videoPath).pipe(res); // 返回整个视频
    }
}


export async function lviobj(req: Request, res: Response) {
    const id = req.query.id;
    if (!id) {
        return res.send({ code: 400 });
    }

    let obj = await getLongVideoList(Number(id));
    return res.send(obj[0]);
}

export async function upDtData(req: Request, res: Response) {
    myEvent.emit('upDtList', 'mysql');
    res.send({ code: 200, msg: 'ok' });
}

export async function setDts(req: Reqs, res: Response) {
    const { id, ...updates } = req.body;

    if (!id) {
        return res.send({
            code: 400,
            tf: 0
        })
    }

    if (req.user && req.user.username && req.user.username != 'yw') {
        return res.send({
            code: 400,
            tf: 0
        })
    }

    let code = await setDtM(id, updates);
    if (code == 200) {
        myEvent.emit('upDtList', 'setCon');
        return res.send({
            code: 200,
            tf: 1
        })
    }

    res.send({
        code: 400,
        tf: 0
    })
}


export async function getShare(req: Request, res: Response) {
    let key = req.query.key;
    if (!key) {
        return res.send({ coed: 400 });
    }
    let a = await getShareDbToken(key.toString());
    if (a.length != 1) {
        return res.send({ coed: 400 });
    }
    let token = getShareToken(a[0].user, a[0].dtid);
    res.send({
        code: 200,
        tf: 1,
        token,
    })
}

export async function setShare(req: Reqs, res: Response) {
    if (!req.user || req.user.username == 'green') {
        return res.send({ coed: 400 });
    }
    let dtid = req.body.dtid;
    if (!dtid) {
        return res.send({ coed: 400 });
    }

    let key = generateRandomString(5);
    let user = req.user.username;

    if (!(await setUserss(user, dtid))) {
        return res.send({ coed: 400 });
    }

    setShareDb(key, user, dtid)
        .then((tf) => {
            if (tf) {
                return res.send({ coed: 200, tf: 1, token: key });
            }
            return res.send({ code: 400, tf: 0 });
        })
}

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters[randomIndex];
    }
    return result;
}