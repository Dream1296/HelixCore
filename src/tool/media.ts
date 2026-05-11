import { getUrl } from "@/pathUtils";
import path from "path";
import { fileIsDir } from "./filePath";
import { execSync, spawn } from "child_process";
import { getVideoCodec, transcodeToH264 } from "@/dev/ffmpeg/myFFmpeg";



// 传入一个
export async function ensureVideoToh254(inPathArr: string[],outPathArr:string[]){
    
    if(inPathArr.length != outPathArr.length){
        throw new Error('/dream/HelixCore/src/tool/media.ts ensureVideoToh254  原文件数量和目标文件数量不一致 ');
    }

    for (let i = 0; i < inPathArr.length; i++) {
        let inVideoPath = inPathArr[i];
        let outVideoPath = outPathArr[i];
        // 用 判断文件是否存在
        if (!fileIsDir(path.dirname(inVideoPath), path.basename(inVideoPath))) {
            console.log('视频不存在');
            continue;
        }        
        // 如果视频是h254格式,
        if((await getVideoCodec(inVideoPath))== 'h264'){
            continue;
        }        
        // 用 ffprobe 检查视频编码
        await transcodeToH264(inVideoPath,outVideoPath);        
    }
}