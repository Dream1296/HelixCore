import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { getUrl } from '@/pathUtils';
import path from 'path';
import fs from 'fs';
import { socketRequest } from '@/tool/socketReq';

export async function getVideoAu(req: Request, res: Response) {
    const dyDtList = await prisma.dt.findMany({
        select: {
            id: true,
        },
        where: {
            user: 'dy',
            video_num: {
                gt: 0,
            },
        },
    });

    const dyDtIdArr = dyDtList.map(item => item.id);
    if (dyDtIdArr.length === 0) {
        return res.send([]);
    }

    const existingVideoTextList = await prisma.video_text.findMany({
        select: {
            video_id: true,
        },
        distinct: ['video_id'],
    });

    const existingVideoIdArr = existingVideoTextList.map(item => item.video_id);
    const videoArr = await prisma.dt_video.findMany({
        where: {
            dt_id: {
                in: dyDtIdArr,
            },
            ...(existingVideoIdArr.length > 0 ? {
                id: {
                    notIn: existingVideoIdArr,
                },
            } : {}),
        },
    });

    let videoUrl = path.join(getUrl('assets'), 'a', videoArr[0].video_src, '/video/original/', videoArr[0].video_name);
    //判断该文件是否存在
    if (!fs.existsSync(videoUrl)) {
        console.error('视频文件不存在', videoUrl);
        return res.send([]);
    }
    let videoAuPath = `/tmp/video_text/${videoArr[0].id}.aac`;
    console.log(videoUrl);
    
    // 视频转音频
    await socketRequest('/ffmpeg/transcodeToAudio', 'POST', {
        inputPath: videoUrl,
        outputPath: videoAuPath
    }, 'json');

    return res.send({
        code:200,
        videoId:videoArr[0].id,
    });
}



export function getVideoAuFile(req: Request, res: Response){
    let videoAuPath = `/tmp/video_text/${req.query.id}.aac`;
    if (!fs.existsSync(videoAuPath)) {
        console.error('音频文件不存在', videoAuPath);
        return res.send([]);
    }
    return res.sendFile(videoAuPath);
}