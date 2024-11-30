import { getUrl } from "@/pathUtils";
import { dbSql } from "@/utils/dbSql";
import Tesseract from "tesseract.js";
import fs from 'fs';

async function setText() {
    let data = await dbSql<{ id: number, img_src: string, text: string }[]>('SELECT * FROM `dt_img`');
    for (let obj of data) {
        if (obj.text) {
            continue;
        }
        let src = getUrl('root', 'assets', obj.img_src);
        if(!fs.existsSync(src)){
            continue;
        }
        // if(obj.id == 368 || obj.id == 383){
        //     continue;
        // }
        await as(src, obj.id.toString());
    }
}



function as(src: string, id: string) {
    return new Promise<void>((resolve) => {
        recognizeTextFromImage(src)
            .then((text: string) => {
                let sql = `UPDATE dt_img SET text = ? WHERE id = ?;`
                dbSql(sql, [text, id], true);
                resolve();
            }).catch((error) => {
                console.log(`Error processing image ${src}:`, error);
                resolve(); // 继续执行
            });
    });
}

function removeSpaces(text: string): string {
    return text.replace(/\s+/g, ''); // 使用正则表达式去掉所有空格
}

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

setText();
