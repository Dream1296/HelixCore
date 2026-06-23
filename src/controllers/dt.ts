import express, { Request, Response } from 'express';
import { dtList, dtDate, setDt, setDtCom, delDt, getdts, setdtindex, getIdMax, setImg, setVideo, getLongVideoList, setDtBgStyle, getRedisListData, setDtM, setShareDb, setUserss, getShareDbToken, dtidS, getDtLongData, setDtComB, getVideoSrc, isDtExist, serviceDate } from '../models/dt/dt';
import { getemojis } from '../models/emoji';
import { Lists, MulterRequest, Reqs, setDtDataT, user } from '../type';
import path, { join } from 'path';
import { imgCompression } from '../tool/media';
import { userWeizhi, SetuserWeizhi } from '../models/weizhi';
import axios from "axios";
const multer = require('multer');
const jiami = require('../utils/usErcrypto.js').jiami;
import fs from 'fs';
import fsPromises from 'fs/promises';
import { dtAdd, dtComPro, imgcl } from '../services/dtAdd';
// import { dtAdd_ah } from '../services/dt_ah';
import { dtFind, dtFinds } from '../services/dtSearch';
import { jiamiString } from '@/utils/cryptoUtils';
import { dbSql } from '@/utils/dbSql';
import { getUrl } from '@/pathUtils';
import { getDtDataImg } from '@/services/dtDataT';
import { dtDataAdd } from '@/services/dtDataAdd';
import { execSync, spawn } from 'child_process';
import { abort, emit } from 'process';
import { myEvent } from '@/services/evenTs';
import { getShareToken } from '@/services/token';
import { Query } from '../middlewares/routesType';
import * as t from 'io-ts';
import { getlinkScreen } from '@/services/linkScreen';
import { linkScreenRefresh } from '@/services/Aether';
import { addDB, processImage } from '@/services/imgdataArr';
import { fileIsDir, isImgTemp, isVideoTemp, mvImg, mvVideo } from '@/tool/filePath';
import { formatString, mvFileName } from '@/utils/time';
import { prisma } from '@/config/prisma';
import { getThumbnail, setThumbnail } from '@/services/MyLRU';
import { checkFileType } from '@/tool/checkFile';
import { generateRandomString } from '@/tool/Text';
import { hasAccessDtFileLoa, hasAccessDtloa } from '@/services/authorization';
import { getnowDate } from '@/tool/Time';
import { getDtImgFs, getDtvideoCoverFs, getDtvideoFs } from '@/fs';

//获取列表信息和评论信息
export async function getDtList(req: Reqs, res: Response) {
    const clientIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(clientIp);

    let a = req.query as t.TypeOf<typeof Query>;
    let loa = Number(req.query.loa);
    let aes = Number(req.query.aes);
    if (isNaN(loa)) {
        loa = 0; // 默认值
    }
    if (isNaN(aes)) {
        aes = 0;
    }

    let user = (req.user?.username) ? req.user.username : "guest";

    if (req.user?.dtid && req.user.dtid != -1) {
        user = process.env.Guest!;
    }


    let listData: Lists[] = await dtList(user, loa);;


    // listData = await dtAdd(listData);
    // 对一些数据进行修改
    await dtAdd(listData, user, loa);


    //插入其他组件数据
    let datas = await dtDataAdd(listData, req.user!, loa);


    let resData = {
        code: 200,
        loa: loa,
        aes: aes,
        message: 'success',
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
    const dtid = Number(req.query.id);
    let user = req.user?.username!;
    // let loa = Number(req.query.loa);

    if (!dtid || dtid == -1) {
        return res.status(400).send({ code: 400, msg: "参数不全" });
    }

    if (req.user?.dtid != dtid && req.user?.dtid != -1) {
        user = process.env.Guest!;
    }

    if (!isDtExist(dtid)) {
        return res.status(404).send({ code: 404, msg: "dt不存在" });
    }

    let tf = await hasAccessDtloa(req.user!, dtid);

    if (!tf) {
        return res.send({ code: 403, msg: "权限错误" });
    }

    let list = await dtList(user, 1);
    let dt = list.find(a => a.id == dtid);
    if (!dt) {
        return res.status(403).send({ code: 403, msg: "权限错误" });
    }

    res.send({
        code: 200,
        data: dt,
    })

}

export async function dtfinds(req: Reqs, res: Response) {
    let date = +new Date();
    const bq = req.query.bq as string;
    const loa = req.query.loa || 0;
    const user = req.user?.username || process.env.Guest!;

    if (!bq) {
        return res.send({ code: 400 });
    }

    let numArr: {
        id: number;
        num: number;
    }[];

    //搜索 返回排序后的id和质信度
    numArr = await dtFinds(bq as string, user, Number(loa));


    let List = await dtList(user, Number(loa));

    let newList = [];
    for (let id of numArr) {
        let dt = List.find(a => a.id == id.id);

        if (!dt) {
            continue;
        }
        newList.push({
            type: 'A',
            ...dt,
            score: id.num,
        })
    }
    let time = -(date - (+new Date()));

    return res.send({ code: 200, time, data: newList, });
}

export async function dtindex(req: Reqs, res: Response) {
    const dtid = req.body.id;
    const dtindex = req.body.dtindex;
    if (!dtid || !dtindex) {
        return res.send({
            code: 400,
        })
    }
    if (req.user?.username != 'yw') {
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

    if (!req.user?.username || req.user.username == 'guest') {
        return res.send({
            code: 400,
        })
    }
    const user = req.user.username;
    let content = req.body.content;
    const dtId = req.body.dtId as number;
    const imgNameArr = req.body.imgNameArr as string[];
    const imgNum = imgNameArr.length;
    const date = getnowDate();

    if (imgNameArr && imgNum > 0) {

        if (!isImgTemp(imgNameArr)) {
            return res.send({
                code: 400,
                msg: "图片不存在"
            })
        }

        if (mvImg(imgNameArr)) {

            let comId = Number((await dbSql<{ id: string }[]>('SELECT max(id) as id FROM `dt_comments` '))[0].id) + 1;
            let a = await setDtComB(comId, imgNameArr);
        }
    }

    content = await dtComPro(dtId, content);
    if (content == 'null') {
        console.log('add');

        return res.send({ tf: 1 });
    }

    if (req.user.username == 'dlhe') {

    }



    const a: any = await setDtCom(date, content, dtId, user, imgNum);
    if (a.tf == 1) {
        res.send({ tf: 1 });
    }
}


//获取时间信息
export async function dtDates(req: Request, res: Response) {
    let year = req.query.year || 2024;
    const data = await dtDate(Number(year));
    res.send(data);
}

export async function setdt(req: Request, res: Response) {
    const setData: setDtDataT = req.body;
    const id = Number(setData.id);

    if (!id) {
        return res.status(400).send({ code: 400, msg: '缺少dt id' });
    }

    const data: Record<string, string | number | Date> = {};

    if (setData.user !== undefined) {
        data.user = setData.user;
        data.loa = 10;
        data.bg_style = 7
    }
    if (setData.text !== undefined) {
        data.text = setData.text;
    }
    if (setData.imgShowAll !== undefined) {
        data.img_show_num = setData.imgShowAll;
    }
    if (setData.imgAllNum !== undefined) {
        data.img_all_num = setData.imgAllNum;
    }
    if (setData.videoShowAll !== undefined) {
        data.video_show_num = setData.videoShowAll;
    }
    if (setData.videoNum !== undefined) {
        data.video_num = setData.videoNum;
    }
    if (setData.loa !== undefined) {
        data.loa = setData.loa;
    }
    if (setData.bgStyle !== undefined) {
        data.bg_style = setData.bgStyle;
    }
    if (setData.date !== undefined) {
        const date = new Date(setData.date);
        if (Number.isNaN(date.getTime())) {
            return res.status(400).send({ code: 400, msg: 'date格式错误' });
        }
        data.date = date;
    }

    if (Object.keys(data).length === 0) {
        return res.status(400).send({ code: 400, msg: '没有可修改字段' });
    }

    try {
        await prisma.dt.update({
            where: { id },
            data,
        });
        myEvent.emit('upDtList', 'setdt');
        return res.send({ code: 200 });
    } catch (error) {
        return res.status(400).send({ code: 400, msg: '修改失败' });
    }

}

export async function dtDataImg(req: Reqs, res: Response) {
    let year = req.query.year || 2024;
    let id = req.query.id || '2000';


    let buffer: Buffer<any> = Buffer.alloc(0);

    if (req.user?.username == 'dlhe') {
        let title = '服务器重启记录';
        const data = await serviceDate(Number(year));
        const dateNow = new Date();
        data.push(`${dateNow.getFullYear()},${dateNow.getMonth() + 1},${dateNow.getDate()}`);
        buffer = await getDtDataImg(title, data);
    } else {
        let title = '动态提交历史';
        const data = await dtDate(Number(year));
        const dateNow = new Date();
        data.push(`${dateNow.getFullYear()},${dateNow.getMonth() + 1},${dateNow.getDate()}`);
        buffer = await getDtDataImg(title, data);
    }

    // res.setHeader('Content-Type', 'image/png');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });

    res.end(buffer);

}

//获取图片
export async function dtimg(req: Reqs, res: Response) {
    let Reqdtid = req.query.dtid;
    let Reqindex = req.query.index;
    let size = Number(req.query.size) ?? 0;

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402, msg: "参数不全" });
    }


    let tf = await hasAccessDtloa(req.user!, dtid);

    if (!tf) {
        return res.send({ code: 402 });
    }

    let buffer = await getDtImgFs(dtid, index, Number(size), 'buffer');
    console.log(buffer);
    
    res.writeHead(200, {
        'Content-Type': buffer.ContentType,
        'Content-Length': buffer.data.length
    });
    res.end(buffer.data);
}

export async function dtimgCom(req: Reqs, res: Response) {
    let Reqdtid = req.query.comid;
    let Reqindex = req.query.index;
    let size = req.query.size;
    //0或空为压缩图，其他为原图

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402, msg: "参数不全" });
    }

    let sqlStr = `SELECT img_src,img_name FROM dt_comments_img WHERE comment_id = ${dtid} AND img_index = ${index};`


    let imgSrc = (await dbSql<{ img_src: string, img_name: string }[]>(sqlStr))[0];

    // return resImg(imgSrc, size, res);
}




//获取原图
export async function dtimgs(req: Request, res: Response) {
    // let filename = req.query.name as string;
    // let urls = path.join(__dirname, "../../img");
    // let filePath = path.join(urls, filename);
    // res.sendFile(filePath);
}


// let videoArr:string[] = [];
let videoSet = new Set<string>([]);

//视频
export async function dtvideo(req: Reqs, res: Response) {

    let Reqdtid = req.query.dtid;
    let Reqindex = req.query.index;

    let dtid;
    let index;

    if (Reqdtid && Reqindex) {
        dtid = Number(Reqdtid);
        index = Number(Reqindex);
    } else {
        return res.send({ code: 402 });
    }

    let tf = await hasAccessDtloa(req.user!, dtid);
    if (!tf) {
        return res.send({ code: 401 });
    }


    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const maxChunkSize = 1024 * 1024;
     
        const end = Number(parts[1]) > 0 ? parts[1] : '0';
        
        let buffer = await getDtvideoFs(dtid, index, start, Number(end), maxChunkSize, 'buffer');
        
        console.log(buffer.chunksize);
        
        const head = {
            'Content-Range': `bytes ${buffer.start}-${buffer.end}/${buffer.fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': buffer.chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        buffer.data.pipe(res);
    } else {
        let buffer = await getDtvideoFs(dtid, index, -1, -1, 0, 'buffer');
        console.log(buffer.fileSize);
        const head = {
            'Content-Length': buffer.fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        buffer.data.pipe(res);
    }
}




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

        console.log(dtid);
        
    let tf = await hasAccessDtloa(req.user!, dtid);
    if (!tf) {
        return res.send({ code: 401 });
    }
    
    
    let buffer = await getDtvideoCoverFs(dtid, index, 1000, 'buffer');
        
    res.setHeader('Content-Type', buffer.ContentType);
    res.end(buffer.data);
}





// 设置图片存储引擎和文件名
const storage = multer.diskStorage({
    destination: function (req: Request, file: Response, cb: any) {
        let upImg = getUrl('assets', 'a/dtimg_temp')
        cb(null, upImg); // 存储的目录，如果不存在会自动创建
    },
    filename: function (req: Request, file: Response, cb: any) {
        let fileName = req.body.filename;
        let newFileName = mvFileName(fileName);
        req.body.filename = newFileName;
        cb(null, newFileName);
    }
});

//视频存储
const storageVideo = multer.diskStorage({
    destination: function (req: Request, file: Response, cb: any) {
        cb(null, getUrl('assets', 'a/dtvideo_temp')); // 存储的目录，如果不存在会自动创建
    },
    filename: function (req: Request, file: Response, cb: any) {
        let fileName = req.body.filename;
        let newFileName = mvFileName(fileName);
        req.body.filename = newFileName;
        cb(null, newFileName);
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
export async function updt(req: MulterRequest, res: Response) {
    if (!req.file) {
        return res.status(400).send({ error: '文件上传失败' });
    }
    res.send({ tf: 1, fileName: req.file.filename });
}
export async function upvideo(req: MulterRequest, res: Response) {
    if (!req.file) {
        return res.status(400).send({ error: '文件上传失败' });
    }
    res.send({ tf: 1, fileName: req.file.filename });
}

function stopTime(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    })
}

export async function postdt(req: Reqs, res: Response) {
    let text = req.body.text as string;
    let img = req.body.img as string[];
    let img_show_num = req.body.imgShowNum as string;
    let img_all_num = img.length.toString();
    const date = req.body.date;
    const imgDir = req.body.imgDir as string | undefined;
    const loa: number = isNaN(Number(req.body.loa)) ? 0 : Number(req.body.loa);
    let video = req.body.video as string[];
    let videoNum = video.length.toString();
    if (img_show_num > img_all_num) {
        img_show_num = Number(img_all_num) > 6 ? '6' : img_all_num;
    }

    if (!req.user?.username || req.user.username == process.env.Guest) {
        res.send({
            code: 403
        });
    }


    // 适当的延迟，保证正确写入。
    if (Number(img_all_num) > 0) {
        await stopTime(1000);
    }


    //图片处理
    if (img) {
        let imgArr: string[] = img;

        //判断图片是已上传到临时目录
        if (!isImgTemp(imgArr)) {
            return res.send({
                code: 400,
                error: 1
            })
        }

        if (!mvImg(imgArr)) {
            return res.send({
                code: 400,
                error: 2
            })
        }
    }

    if (video.length != 0) {
        //判断视频是否存在
        if (!isVideoTemp(video)) {
            return res.send({
                code: 400,
            })
        }

        if (!mvVideo(video)) {
            return res.send({
                code: 400,
                error: 3
            })
        }
    }

    //处理图片文件夹
    if (imgDir) {
        //待上传图片存储目录
        let urls = getUrl('assets', 'dtimgUpTemp');

        //判断文件夹是否存在
        let falg = fs.existsSync(urls);
        if (!falg) {
            return res.send({
                code: 400,
                error: 2
            })
        }
        //读取文件夹内文件
        const files = fs.readdirSync(urls);
        for (const fileName of files) {
            //文件完整路径
            const filePath = path.join(urls, fileName);

            const fileStats = fs.statSync(filePath);
            // 只处理文件，忽略目录  
            if (!fileStats.isFile()) {
                continue;
            }
            const ext = path.extname(fileName); // 获取文件扩展名

            function fn(fileName: string, type: 'img' | 'video') {
                let newName = mvFileName(fileName)
                let newFilePath = path.join(urls, newName);
                let newPath = '';
                if (type == 'img') {
                    newPath = path.join(getUrl('assets', 'a/', process.env.aNew!, "img/original"), newName);
                }
                if (type == 'video') {
                    newPath = path.join(getUrl('assets', 'a/', process.env.aNew!, "video/original"), newName);
                }
                // 移动文件到目标目录  
                try {
                    //重命名
                    fs.renameSync(filePath, newFilePath);
                    //移动
                    fs.renameSync(newFilePath, newPath);
                } catch (err) {
                    return false
                }
                return newName;
            }

            if (checkFileType(ext) == 'img') {
                let falg = fn(fileName, 'img')
                if (!falg) {
                    return res.send({
                        code: 400,
                        error: 4
                    })
                }
                img.push(falg);
                img_all_num = img.length.toString();
            }

            if (checkFileType(ext) == 'video') {
                let falg = fn(fileName, 'video')
                if (!falg) {
                    return res.send({
                        code: 400,
                        error: 4
                    })
                }
                video.push(falg);
                videoNum = video.length.toString();
            }
        }
    }


    //查询当前dt表中id的最大值
    let id = Number(await getIdMax()) + 1;



    img_all_num = img.length.toString();
    videoNum = video.length.toString();
    let im;
    const vi = setVideo(id, video);

    //loa不为0或1时，加密文本内容
    if (req.user?.username == 'dlhe') {
        text = "^AES^" + jiamiString(text, process.env.loa13!);
    }

    im = setImg(id, img, 'dtimg');

    const dt = setDt(id.toString(), req.user!.username, text, img_show_num, img_all_num, videoNum, date, loa);
    Promise.all([im, vi, dt]).then((a) => {
        res.send({ tf: 1 });
    })

}




export async function getLongText(req: Reqs, res: Response) {

    let dtid = req.query.dtid as string;

    if (!dtid) {
        return res.status(400).send({
            code: 400
        })
    }

    const fileObj = await prisma.dt_text.findMany({
        where: {
            dtid: Number(dtid)
        }
    });

    if (fileObj[0].loa != 0) {
        let tf = await hasAccessDtFileLoa(req.user!, fileObj[0].dtid, fileObj[0].loa);
        if (!tf) {
            return res.send({ code: 403 });
        }
    }


    let data = await getDtLongData(dtid);

    res.send({
        code: 200,
        data: data
    });


}

export function getFile(dtid: number, imgNun: number, videoNum: number) {
    let urls = getUrl('assets', 'dtimgUpTemp');
    let urls2 = getUrl('assets', 'dtimg');
    let urls3 = getUrl('assets', 'dtvideo');
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



    const im = setImg(dtid, img, 'dtimg', imgNun);
    const vi = setVideo(dtid, video, videoNum);
}



export async function delDts(req: Reqs, res: Response) {
    const dtId = req.body.id;
    if (!dtId) {
        return res.send({ tf: 0 });
    }
    if (req.user?.username != 'yw') {
        return res.send({ code: 400, tf: 0 });
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
    // const name = req.query.name as string;
    if (!lei) {
        res.setHeader('Content-Type', 'png/image');
        // res.send(getemojis('weixin', '微信.png'))
        res.status(400).send({ code: 400 });
    }
    res.setHeader('Content-Type', 'png/image');
    res.send(getemojis(lei));
}

export function getemojilist(req: Request, res: Response) {
    res.sendFile(getUrl('public', 'emoji/list.json'));
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
    const videoPath = getUrl('assets', 'longVideo', src.toString()); // 获取视频文件的路径
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
    if (req.query.passwd != '2004') {
        return res.status(400).send({ code: 400, msg: 'error' });
    }
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

export async function linksc(req: Reqs, res: Response) {
    let dtNum = req.query.dtid;
    if (!dtNum) {
        return res.send({ code: 400 });
    }

    let resc = await getdts('guest', Number(dtNum), 0);
    if (!resc) {
        res.send({ code: 400 });
    }

    let buffer = await getlinkScreen(resc!.id, resc!.name, resc!.text, resc!.date);
    let data = await processImage(buffer);
    if (data) {
        let a = await addDB(data.blackArr, data.redArr);
    }

    res.setHeader('content-type', 'image/png');
    res.send(buffer);
}



export async function linkScreenControl(req: Reqs, res: Response) {
    let a = await linkScreenRefresh();
    res.send(a.toString());
}



export async function linkScreenShow(req: Reqs, res: Response) {

    let sql = 'SELECT * FROM dt_Ink_screen WHERE id = (SELECT MAX(id) FROM dt_Ink_screen); ';
    let data = await dbSql<{ black: Buffer, red: Buffer }[]>(sql);
    let blackArr = new Array(15200).fill(0);
    let redArr = new Array(15200).fill(0);

    const bufferBlack = data[0].black;
    const bufferRed = data[0].red;

    for (let i = 0; i < 15200; i++) {
        blackArr[i] = bufferBlack[i];
        redArr[i] = bufferRed[i];
    }

    if (req.query.color == 'red') {
        return res.json(redArr);
    } else {
        res.json(blackArr);
    }

}

//年份图片
export async function getYear(req: Reqs, res: Response) {
    let file = getUrl('assets', 'system/year');
    let yearNum = Number(req.query.year);

    if (!req.query.year) {
        return res.sendFile(path.join(file, '20xx.png'));
    }

    if (yearNum >= 2015 && yearNum <= 2026) {
        return res.sendFile(path.join(file, yearNum + '.png'));
    }

    return res.sendFile(path.join(file, '20xx.png'));
}

export async function dtFile(req: Reqs, res: Response) {
    const rawFileId = req.query.fileId ?? req.query.dtid;
    const fileId = Number(rawFileId);

    if (!rawFileId || Number.isNaN(fileId)) {
        return res.send({
            code: 401,
        })
    }

    const fileObj = await prisma.dt_file.findUnique({
        where: {
            id: fileId,
        }
    });


    if (!fileObj) {
        return res.send({
            code: 404,
        })
    }

    if (fileObj.loa != 0) {
        let tf = await hasAccessDtFileLoa(req.user!, fileObj.dt_id, fileObj.loa);
        if (!tf) {
            return res.send({
                code: 403,
            })

        }
    }


    let fileSrc = getUrl('assets', 'file', fileObj.file_src, fileObj.file_name);

    // 检查文件是否存在
    fs.access(fileSrc, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回 404 错误
            return res.status(404).send('File not found');
        }

        // 设置下载的文件名（可选，你可以从 file_src 中提取或设置其他名称）
        // let expandName = fileObj.file_src.split('.')[fileObj.file_src.split('.').length -1 ];
        const fileName = path.basename(fileObj.name + "&&" + fileObj.file_src);
        // 完善下err类型
        res.download(fileSrc, fileName, (err?: NodeJS.ErrnoException) => {
            if (err) {
                const isClientAbort =
                    err.code === "ECONNABORTED" ||
                    err.code === "ECONNRESET" ||
                    res.destroyed;

                if (isClientAbort) {
                    console.warn("Download aborted by client:", fileId, fileName);
                    return;
                }

                console.error("Error downloading file:", err);

                if (!res.headersSent && !res.writableEnded) {
                    res.status(500).send("Error downloading file");
                }
                return;
            }
        })
    })
}


export async function keepRun(req: Reqs, res: Response) {

    // await keepRunOcr('824');
    // await keepBadminton('822');
    res.send("ok");
}

export async function userIndex(req: Reqs, res: Response) {
    let user = req.user?.username!;
    //查询所有为user的，使用idex排序
    let index_arr = await prisma.dt_index_arr.findMany({
        where: {
            user: user,
        },
        orderBy: {
            idx: 'asc'
        }
    });
    let indexArr = index_arr.map(e => e.name);
    indexArr.push("#!rest")
    return res.send({
        code: 200,
        index_arr: indexArr
    })

}
