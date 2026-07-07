// 实现fs文件系统调用

import { getVideoSrc } from "@/models/dt/dt";
import { socketRequest } from "@/tool/socketReq";

//图片获取
export async function getDtImgFs(dtid: number, index: number, size: number, type: 'buffer') {
    let url = '/img/getDtImgFs?dtid=' + dtid + '&index=' + index + '&size=' + size + '&type=' + type;
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