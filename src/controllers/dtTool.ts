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

//重命名图片
export function isMvNameImg(imgArr: string[]) {
    let newImgArr: string[] = [];
    let urls = getUrl('assets', 'dtimg_temp');
    // 用于生成不重名的文件名  
    let fileCounter = 0;
    for (let i = 0; i < imgArr.length; i++) {
        // 生成唯一的时间戳（毫秒级）  
        const uniqueTimestamp = Date.now().toString();
        const ext = path.extname(imgArr[i]);
        let newName = `${imgArr[i]}_${uniqueTimestamp}_${fileCounter++}${ext}`;
        try {
             fs.renameSync(path.join(urls,imgArr[i]),path.join(urls,newName) );
        } catch (error) {
            return false
        }

        newImgArr[i] = newName;
    }   
    return newImgArr;
}

//移动临时图片
export function isMvImg(imgArr: string[], loa?: number) {
    let newNameArr = isMvNameImg(imgArr);
    if(newNameArr == false){
        return false;
    }

    //移动图片
    for (let i = 0; i < newNameArr.length; i++) {
        let url = 'dtimg';
        if (loa == 13) {
            url = 'dtimg_13';
        }
        const path1 = path.join(getUrl('assets', 'dtimg_temp'), newNameArr[i]);
        const path2 = path.join(getUrl('assets', url), newNameArr[i]);
        try {
            fs.renameSync(path1, path2);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    return newNameArr;

}