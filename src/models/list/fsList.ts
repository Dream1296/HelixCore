import { getFileFsStream } from "@/services/fs";
import { forwardRequest, socketRequest } from "@/tool/socketReq";
import { Writable } from "node:stream";
import { Request, Response } from "express";

export interface FileInfo {
    name: string;
    size: number;
    permissions: string;
    owner: string;
    group: string;
    date: string;
    type: "file" | "directory" | "symlink" | "block" | "char" | "socket" | "pipe" | "unknown";
    fullPath: string;
    inode: string;
    devId: number;
}

// 获取目录列表
export async function getDirList(dir: string) {
    let url = '/list/listPath?path=' + dir;
    let data = await socketRequest<{ code: number, data: FileInfo[] }>('fs', url, 'GET', null, 'json');
    return data.data.data;
}

// 获取图片缩略图
export async function getImgTFs(hash: string) {
    let url = '/list/getImgT?hash=' + hash;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer');
    return data;
}

// 更新列表
export async function upFstListDir(dir: string) {
    let url = '/list/upFstListDir?path=' + dir;
    let data = await socketRequest<{ code: number}>('fs', url, 'GET', null, 'json');
    return data.data;
}

// 传入路径，获取文件
export async function getFileFsStreamList(filePath: string, resStream ? :Writable) {
    let url = '/list/getFile?path=' + filePath;
    let data = await socketRequest<Buffer>('fs', url, 'GET', null, 'buffer', undefined, resStream);
    return;
}


// 获取视频文件流
export async function getVideoFsStream(req: Request,res:Response,path: string) {
    let url = '/list/getVideo?path=' + encodeURIComponent(path);
    
    forwardRequest('fs', url, req, res);
}