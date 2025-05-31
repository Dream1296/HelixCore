import { getUrl } from '@/pathUtils';
import fs from 'fs';
import path from 'path';
//判断某个目录中是否包含某个文件
export function fileIsDir(dir: string, file: string) {
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

//判断图片是否包含在上传临时文件夹中
export function isImgTemp(imgArr: string[]) {
    for (let i = 0; i < imgArr.length; i++) {
        if (!fileIsDir(getUrl('assets', 'dtimg_temp'), imgArr[i])) {
            return false;
        }
    }
    return true;
}

//判断图片是否包含在上传临时文件夹中
export function isVideoTemp(videoArr: string[]) {
    for (let i = 0; i < videoArr.length; i++) {
        if (!fileIsDir(getUrl('assets', 'dtvideo_temp'), videoArr[i])) {
            return false;
        }
    }
    return true;
}


//移动临时图片
export function mvImg(imgArr: string[], loa?: number) {
    //移动图片
    for (let i = 0; i < imgArr.length; i++) {
        let url = 'dtimg';
        if (loa == 13) {
            url = 'dtimg_13';
        }
        const path1 = path.join(getUrl('assets', 'dtimg_temp'), imgArr[i]);
        const path2 = path.join(getUrl('assets', url), imgArr[i]);
        try {
            fs.renameSync(path1, path2);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    return true;
}

//移动视频
export function mvVideo(videoArr: string[], loa?: number) {
    for (let i = 0; i < videoArr.length; i++) {
        let url = 'dtvideo';
        if (loa == 13) {
            url = 'dtvideo_13';
        }
        const path1 = path.join(getUrl('assets', 'dtvideo_temp'), videoArr[i]);
        const path2 = path.join(getUrl('assets', url), videoArr[i]);
        try {
            fs.renameSync(path1, path2);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    return true;
}