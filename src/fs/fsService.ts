import { getUrl } from '@/pathUtils';
import { getThumbnail } from '@/services/MyLRU';
import { fileIsDir } from '@/tool/filePath';
import { imgCompression } from '@/tool/media';
import fs from 'fs';
import path from 'path';

export async function getDtImgFsService(dtid: number, index: number, size: number, type: 'buffer') {
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
        throw new Error("图片不存在");
        return
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
        return sendFile(filePath,type);
    }


    if (size == 0) {
        if (filename.endsWith('.gif')) {
            let ThumbnailData = getThumbnail(filePath);
            if (ThumbnailData) {
                console.log('从缓存中拿缩略图');
                return ThumbnailData
            }
            return sendFile(filePath,type);
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
            return ThumbnailData
        }

        if (fileIsDir(img_log, filename)) {
            return sendFile(thumbPath,type);
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
            return data;
        } catch (e) {
            console.log('压缩错误', e);
            // filePath = path.join(fileurl, filename);
            // return res.sendFile(filePath);
            filePath = path.join(urls, './system/imgError.png');

            return sendFile(filePath,type);
        }
    } else {


        return sendFile(filePath,type);
    }

}



// 以我们需要的类型发获取文件
export function sendFile(FilePath:string,type:'buffer'){
    if(type = 'buffer'){
        return fs.readFileSync(FilePath);
    }
}