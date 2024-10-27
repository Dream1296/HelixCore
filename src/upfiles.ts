import { getUrl } from '@/pathUtils';
import fs from 'fs';
import path from 'path';

 
 //处理图片文件夹
 function a(){

    let urls = getUrl('root', 'assets', 'dtimgUpTemp');
    let urls2 = getUrl('root', 'assets/dtimg');
    let urls3 = getUrl('root', 'assets/dtvideo');
    let falg = fs.existsSync(urls);
    if (!falg) {
console.error(500);
    }

    // 生成唯一的时间戳（毫秒级）  
    const uniqueTimestamp = Date.now().toString();
    // 用于生成不重名的文件名  
    let fileCounter = 0;
    const files = fs.readdirSync(urls);
    for (const file of files) {
        const filePath = path.join(urls, file);
        const fileStats = fs.statSync(filePath);
        // 只处理文件，忽略目录  
        if (!fileStats.isFile()) {
            continue;
        }
        const ext = path.extname(file); // 获取文件扩展名  
        if (ext == '.jpg' || ext == '.png') {
            const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
            const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
            const targetFilePath = path.join(urls2, newFileName); // 生成目标文件路径  

            if (fileIsDir(urls2, newFileName)) {
                return res.send({
                    code: 400,
                    error:3
                })
            }
            // 重命名文件  
            fs.renameSync(filePath, newFilePath);

            // 移动文件到目标目录  
            fs.renameSync(newFilePath, targetFilePath);
            img.push('./dtimg/' + newFileName);
            fileCounter++;
        }
        if (ext == '.mp4') {
            const newFileName = `${uniqueTimestamp}_${fileCounter}.${ext}`; // 生成新文件名  
            const newFilePath = path.join(urls, newFileName); // 生成新文件路径  
            const targetFilePath = path.join(urls3, newFileName); // 生成目标文件路径  

            if (fileIsDir(urls3, newFileName)) {
                return res.send({
                    code: 400,
                    error:4
                })
            }
            // 重命名文件  
            fs.renameSync(filePath, newFilePath);

            // 移动文件到目标目录  
            fs.renameSync(newFilePath, targetFilePath);
            video.push('./dtvideo/' + newFileName);
            fileCounter++;
        }


    }
 }