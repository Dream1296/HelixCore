import { getImgT, getList } from '@/models/list/list';
import express, { Request, Response } from 'express';
import { access, mkdir, constants } from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { Reqs } from '@/type';

export async function getPathListR(req: Reqs, res: Response) {
    let pathStr = req.query.path as string;
    if (req.user?.username !== 'yw') {
        res.status(400).send({
            code: 400,
        });
        return
    }

    // let pathStr = '/havens/img/2023/2023.12'
    if (!pathStr) {
        return res.status(400).send({
            code: 400,
            data: []
        })
    }
    let data = await getList(pathStr);

    res.send({
        code: 200,
        data,
    });
}

export async function listImgT(req: Reqs, res: Response) {
    if (req.user?.username !== 'yw') {
        res.status(400).send({
            code: 400,
        });
        return
    }
    let dir = req.query.path;
    let hash = req.query.hash;
    if (!dir || !hash) {
        return res.status(400).send({ code: 400 })
    }
    let filePath = await getImgT(dir as string, hash as string);
    if (filePath != '-1') {
        return res.sendFile(filePath, {
            headers: {
                'Content-Type': 'image/png'
            }
        });
    }
    return res.status(400).send({ code: 500 })



}

export async function listImg(req: Reqs, res: Response) {
    if (req.user?.username !== 'yw') {
        res.status(400).send({
            code: 400,
        });
        return
    }
    let filePath = req.query.path;
    if (!filePath) {
        return res.status(400).send({ code: 400 });
    }
    try {
        await access(filePath as string);

        return res.sendFile(filePath as string, {
            headers: {
                'Content-Type': 'image/png'
            }
        });
    } catch (err) {
        return res.status(400).send({ code: 400 });
    }
}

export async function listVideo(req: Reqs, res: Response) {
    if (req.user?.username !== 'yw') {
        res.status(400).send({
            code: 400,
        });
        return;
    }

    let filePath = req.query.path as string;

    if (!filePath) {
        return res.status(400).send({ code: 400 });
    }
    try {
        // 1. 判断文件是否存在
        await access(filePath)
    } catch {
        // 文件不存在
        return res.status(400).send({ code: 400 });
    }

    // // 尝试读取媒体信息
    // await new Promise((resolve) => {
    //     ffmpeg.ffprobe(filePath, (err, metadata) => {
    //         if (err) {
    //             console.error(`⚠️ ffprobe 解析失败: ${err.message}`);
    //             return res.status(400).send({ code: 400 });
    //         } else {
    //             const hasVideoStream = metadata.streams.some(
    //                 (s) => s.codec_type === 'video'
    //             );
    //             if (!hasVideoStream) {
    //                 return res.status(400).send({ code: 400 });
    //             }
    //         }
    //     })
    // })

    let fileSrc = filePath;

    const stat = fs.statSync(fileSrc);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const maxChunkSize = 1024 * 1024;

        // const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : Math.min(start + maxChunkSize - 1, fileSize - 1);

        const chunksize = (end - start) + 1;
        const audioStream = fs.createReadStream(fileSrc, { start, end });




        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };


        res.writeHead(206, head);
        audioStream.pipe(res);
        // res.end(buffer);




    } else {
        //    res.sendFile(fileSrc);
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(fileSrc).pipe(res);
    }


}

export async function listFile(req: Reqs, res: Response){
    if(req.user?.username !== 'yw'){
        res.status(400).send({
            code: 400,
        });
    }
    let filePath = req.query.path as string;
    return res.sendFile(filePath);
}
