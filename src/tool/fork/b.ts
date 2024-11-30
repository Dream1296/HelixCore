import { getUrl } from "@/pathUtils";
import { dbSql } from "@/utils/dbSql";
import Tesseract from "tesseract.js";
import fs from 'fs';
import { fork } from 'child_process';

// 监听来自父进程的消息
process.on('message', async (msg:{ src: string, id: string }) => {

    let text = await recognizeTextFromImage(msg.src);

    let datas = {
        text,
        id:msg.id
    }
    // process.send({reply:"123"})
    if(process && process.send){
        process.send(datas);
    }

});





export async function recognizeTextFromImage(imagePath: string): Promise<string> {
    try {
        const result = await Tesseract.recognize(
            imagePath,
            'chi_sim', // 使用简体中文
            {
                logger: (m) => console.log(m) // 可以选择性地记录进度
            }
        );
        return removeSpaces(result.data.text); // 返回识别的文本
    } catch (error) {
        // console.error('OCR识别失败:', error);
        // throw error;
        console.log('error');
        return 'eooer'
    }
}


function removeSpaces(text: string): string {
    return text.replace(/\s+/g, ''); // 使用正则表达式去掉所有空格
}