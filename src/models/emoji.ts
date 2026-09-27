import path from "path"
import fs from 'fs';
import { getUrl } from "@/pathUtils";
import { getEmoji } from "@/services/fs";
import { emojiErrorIco } from "@/assets/emoji";


export async function getemojis(lei: string) {
    try {
        return (await getEmoji(lei, 'buffer')).data;
    } catch (err) {
        return Buffer.from(emojiErrorIco);
    }
}


//判断某个目录中是否包含某个文件
function fileIsDir(dir: string, file: string) {
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