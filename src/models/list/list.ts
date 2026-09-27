import { exec } from "child_process";
import util from "util";
import fs from 'fs';
import path from 'path';
import { md5Text } from "@/utils/cryptoUtils";
// import { ensureDir, upImgCacheDir } from "./upImgCache";
import { getImgTFs } from "./fsList";
import { access, mkdir, constants } from 'fs/promises';
import { FileInfo, getDirList, upFstListDir } from "./fsList";
import { getBufferMd5 } from "@/cryptoTool";
import { logger } from "@/utils/logger";

// type 0为文件夹，1为图片, 2为视频， 其他为3
type listFile = {
    name: string,
    type: 0 | 1 | 2 | 3,
    hash: string,
}

export async function getList(pathStr: string): Promise<listFile[]> {
    let fileArr: listFile[] = [];
    try {
        const files = await getDirList(pathStr);
        
        for (let file of files) {
            if (file.type == 'directory') {
                fileArr.push({
                    name: file.name,
                    type: 0,
                    hash: '',
                })
                continue;
            }
            
            let type = getFileType(file.name);
            if (type == 1 || type == 2) {
                fileArr.push({
                    name: file.name,
                    type,
                    hash: getFileNameMd5(file),
                })
                continue;
            }

            fileArr.push({
                name: file.name,
                type,
                hash: '',
            })
        }
        upFstListDir(pathStr);

        // upImgCacheDir(pathStr);

        return fileArr;
    } catch (err) {
        logger.err('文件列表获取失败 /src/models/list/list.ts')
        return fileArr;
    }
}


export async function getImgT( hash: string) {
    return (await getImgTFs(hash)).data;
}



/**
 * 根据文件扩展名判断文件类型
 * @param {string} filename - 文件名（如 'example.jpg'）
 * @returns {number} 1=图片, 2=视频, 3=其他
 */
export function getFileType(filename: string): 1 | 2 | 3 {
    // 获取文件扩展名（小写）
    const ext = path.extname(filename).toLowerCase();

    // 定义图片和视频的扩展名集合
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.mpeg'];

    // 判断文件类型
    if (imageExtensions.includes(ext)) {
        return 1; // 图片
    } else if (videoExtensions.includes(ext)) {
        return 2; // 视频
    } else {
        return 3; // 其他
    }
}


const execPromise = util.promisify(exec);


export function getFileHash(fileInfo: FileInfo): string {
    let str = fileInfo.name + fileInfo.size.toString() + fileInfo.date + fileInfo.fullPath;
    return md5Text(str);
}

export function getFileNameMd5(fileInfo: FileInfo): string {
    let name = `${fileInfo.devId}_${fileInfo.inode}`;
    let md5 = getBufferMd5(Buffer.from(name));
    return `${md5.slice(0, 2)}_${md5.slice(2, 4)}_${name}`
}