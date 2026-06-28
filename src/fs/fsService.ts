import { getUrl } from '@/pathUtils';
import { getThumbnail } from '@/services/MyLRU';
import { fileIsDir } from '@/tool/filePath';
import { getVideoCover, imgCompression } from '@/tool/media';
import fs from 'fs';
import path from 'path';

export async function getDtImgFsService(dtid: number, index: number, size: number, type: 'buffer'): Promise<{ data: Buffer, ContentType: string }> {
    let imgSrc = await prisma?.dt_img.findFirst({
        select: {
            img_src: true,
            img_name: true,
        },
        where: {
            dt_id: dtid,
            img_index: index,
        }
    })
    if (!imgSrc) {
        let filePath = path.join(getUrl('assets'), './system/imgError.png');
        return {
            data: sendFile(filePath, type) as Buffer,
            ContentType: 'image/png',
        }
    }



    //资源路径
    let urls = path.join(getUrl('assets'));
    //文件名
    let filename = imgSrc.img_name;
    //文件路径
    let fileurl = path.join(urls, 'a', imgSrc.img_src!, 'img/original');

    //文件全名
    let filePath = path.join(fileurl, filename);

    //缩略图缓存目录
    let img_log = path.join(urls, 'a', imgSrc.img_src!, 'img/compressed');

    // 缩略图路径
    let thumbPath = path.join(img_log, filename);

    if (!fileIsDir(fileurl, filename)) {
        filePath = path.join(urls, './system/imgError.png');
        return {
            data: sendFile(filePath, type) as Buffer,
            ContentType: 'image/png',
        }
    }


    if (size == 0) {
        if (filename.endsWith('.gif')) {
            let ThumbnailData = getThumbnail(filePath);
            if (ThumbnailData) {
                console.log('从缓存中拿缩略图');
                return {
                    data: ThumbnailData,
                    ContentType: 'image/gif',
                }
            }
            return {
                data: sendFile(filePath, type) as Buffer,
                ContentType: 'image/gif',
            }
            // return res.sendFile(filePath, {
            //     headers: {
            //         'Content-Type': 'image/gif' // 设置响应头为 GIF 格式
            //     }
            // });
        }
        // console.log(2);

        //判断是否缓存
        let ThumbnailData = getThumbnail(thumbPath);
        // console.log(ThumbnailData == false);
        // console.log(thumbPath);

        if (ThumbnailData) {
            // console.log('从缓存中拿缩略图');
            return {
                data: ThumbnailData,
                ContentType: 'image/png',
            }
        }

        if (fileIsDir(img_log, filename)) {
            return {
                data: sendFile(thumbPath, type) as Buffer,
                ContentType: 'image/png',
            }
        }
        try {
            let imgBuffer = fs.readFileSync(filePath);
            // 压缩图片
            const data = await imgCompression(imgBuffer, 460, 460);
            console.log('压缩');

            // res.writeHead(200, {
            //     'Content-Type': 'image/png',
            //     'Content-Length': data.length
            // });
            return {
                data: data,
                ContentType: 'image/png',
            }
        } catch (e) {
            console.log('压缩错误', e);
            // filePath = path.join(fileurl, filename);
            // return res.sendFile(filePath);
            filePath = path.join(urls, './system/imgError.png');

            return {
                data: sendFile(filePath, type) as Buffer,
                ContentType: 'image/png',
            }
        }
    } else {
        return {
            data: sendFile(filePath, type) as Buffer,
            ContentType: 'image/png',
        }
    }

}


export async function getDtvideoFsService(dtid: number, index: number, start: number, end: number, maxChunkSize: number, type: 'buffer') {
    let file = (await getDtVideoFile(dtid, index))[0];
    let videoUrl = path.join(getUrl('assets'), 'a', file.video_src, 'video/');

    //原视频文件
    let fileSrc = path.join(videoUrl, 'original', file.video_name);
    //处理后的视频文件
    let fileSrcCompressed = path.join(videoUrl, 'compressed', file.video_name);
    //如果fileSrcCompressed存在，则fileSrc值为fileSrc，否则为fileSrcCompressed
    if (fs.existsSync(fileSrcCompressed)) {
        fileSrc = fileSrcCompressed;
    }

    // //如果fileSrc不存在，则返回错误
    // if (!fileIsDir(path.dirname(fileSrc), path.basename(fileSrc))) {
    //     return res.send({ code: 402 });
    // }

    const stat = fs.statSync(fileSrc);
    const fileSize = stat.size;

    if (start == -1) {
        const audioStream = fs.createReadStream(fileSrc);
        return {
            data: audioStream,
            fileSize: fileSize,
            start,
            end,
        }
    }

    end = end != 0
        ? parseInt(end.toString(), 10)
        : Math.min(start + maxChunkSize - 1, fileSize - 1);
    console.log(`${start} == ${end}`);

    const chunksize = (end - start) + 1;

    const audioStream = fs.createReadStream(fileSrc, { start, end });

    return {
        data: audioStream,
        fileSize: fileSize,
        chunksize,
        start,
        end,
    }
}

export async function getDtvideoCoverFsService(dtid: number, index: number, size: number, type: 'buffer') {
    let file = (await getDtVideoFile(dtid, index))[0];

    let videoUrl = path.join(getUrl('assets'), 'a', file.video_src, 'video/');

    let videoFileSrc = path.join(videoUrl, 'original', file.video_name);

    //视频预览图名字
    let videoImg = file.video_name.slice(0, -4) + '.png';

    let videoSrc = path.join(videoUrl, 'cover');

    // 缓存
    let ThumbnailData = getThumbnail(path.join(videoSrc, videoImg));
    if (ThumbnailData) {
        // console.log('从缓存中拿视频封面图');
        return {
            data: ThumbnailData,
            ContentType: 'image/png',
        }
    }
    console.log(videoSrc,videoImg);
    
    // 检查封面图是否存在
    if (fileIsDir(videoSrc, videoImg)) {  
        console.log(1);
        
        return {
            data: sendFile(path.join(videoSrc, videoImg), type) as Buffer,
            ContentType: 'image/png',
        }
    }

    

    let videoFileSrcBuffer = fs.readFileSync(videoFileSrc);
    console.log('请求');
    
    let outImgBuff = await getVideoCover(videoFileSrcBuffer, 1);
    let outImgPath = path.join(videoUrl, 'cover', videoImg);
    fs.writeFileSync(outImgPath, outImgBuff);
    return {
        data: outImgBuff,
        ContentType: 'image/png',
    }
}

export async function getDtVideoFile(dtid: number, index: number) {
    return await prisma!.dt_video.findMany({
        where: {
            dt_id: dtid,
            video_index: index
        }
    })

}



// 以我们需要的类型发获取文件
export function sendFile(FilePath: string, type: 'buffer') {
    if (type = 'buffer') {
        return fs.readFileSync(FilePath);
    }
}