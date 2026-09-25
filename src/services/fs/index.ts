// 实现fs文件系统调用

import { getVideoSrc } from "@/models/dt/dt";
import { socketPathFs, socketRequest } from "@/tool/socketReq";
import http from "http";
import { Stream } from "nodemailer/lib/xoauth2";

//图片获取
export async function getDtImgFs(dtid: number, index: number, size: number, type: 'buffer') {
    let url = '/img/getDtImgFs?dtid=' + dtid + '&index=' + index + '&size=' + size + '&type=' + type;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');
    return {
        data: data.data,
        ContentType: data.header!['x-image-type'],
    };
}

// 评论图片获取
export async function getDtComImgFs(dtid: number, index: number, size: number, type: 'buffer') {
    let url = '/img/getDtComImgFs?comid=' + dtid + '&index=' + index + '&size=' + size + '&type=' + type;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');
    return {
        data: data.data,
        ContentType: data.header!['x-image-type'],
    };
}

// 视频获取
export async function getDtvideoFs(dtid: number, index: number, start: number, end: number, maxChunkSize: number, type: 'buffer') {
    // let data = await getDtvideoFsService(dtid, index, start, end, maxChunkSize, type);
    // return data;
    let url = '/video/getVideo?dtid=' + dtid + '&index=' + index + '&start=' + start + '&end=' + end + '&maxChunkSize=' + maxChunkSize + '&type=' + type;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');

    return {
        data: data.data,
        ContentType: data.header!['content-type'] ?? 'video/mp4',
        chunksize: Number(data.header!['content-length']),
        fileSize: Number(data.header!['x-file-size'] ?? data.header!['content-length']),
        start: Number(data.header!['x-start']),
        end: Number(data.header!['x-end'])
    };
}

//视频封面
export async function getDtvideoCoverFs(dtid: number, index: number, size: number, type: 'buffer') {
    // let data = await getDtvideoCoverFsService(dtid, index, size, type);
    // return data;
    let url = '/video/getDtvideoCoverFs?dtid=' + dtid + '&index=' + index + '&type=' + type;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');
    return {
        data: data.data,
        ContentType: data.header!['x-image-type'],
    };
}

// 表情包下载
export async function getEmoji(id: string, type: 'buffer') {
    let url = '/emoji/emoji?id=' + id + '&type=' + type;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');
    return {
        data: data.data,
        ContentType: data.header!['x-image-type'],
    };
}

// 图片上传
export async function upImgFs(dtid: number, index: number, fileName: string, fileMd5: string, fileBuffer: Buffer | Stream, nullFile  = '0') {
    let url = '/fileUp/upImg';
    if(nullFile && nullFile === '1') {
        url += '?nullFile=1';
    }
    let headers = {
        'x-file-name': fileName,
        'x-file-md5': fileMd5,
        'x-dt-id': dtid.toString(),
        'x-dt-index': index.toString()
    };
    let data = await socketRequest<{ code: number }>('fs', url, 'POST', fileBuffer, 'json', headers);
    return data.data;
}

// 视频上传
export async function upVideoFs(dtid: number, index: number, fileName: string, fileMd5: string, fileBuffer: Buffer | Stream, nullFile = '0') {
    let url = '/fileUp/upVideo';
    if(nullFile && nullFile === '1') {
        url += '?nullFile=1';
    }
    let headers = {
        'x-file-name': fileName,
        'x-file-md5': fileMd5,
        'x-dt-id': dtid.toString(),
        'x-dt-index': index.toString()
    };
    let data = await socketRequest<{ code: number }>('fs', url, 'POST', fileBuffer, 'json', headers);
    return data.data;
}

// 文件下载
export function getFileFsStream(
    fileId: number,
): Promise<{ stream: http.IncomingMessage, size: number, fileName: string }> {
    return new Promise((resolve, reject) => {

        let socketPath = socketPathFs
        const req = http.request(
            {
                socketPath,
                path: '/file/fileDow?fileId=' + fileId,
                method: 'GET',
            },
            (res) => {

                let size = Number(res.headers["content-length"]);
                let fileName = res.headers["x-file-name"] as string;
                resolve({
                    stream: res,
                    size: size,
                    fileName: fileName
                });
            }
        );
        req.on('error', (err) => {
            reject(err);
        });
        req.end();
    });
}