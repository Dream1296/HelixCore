import Tesseract from "tesseract.js";
import fs from 'fs';


// 监听来自父进程的消息
process.on('message', async (msg: { src: string, id: string }) => {

    let text = await recognizeTextFromImage(msg.src);

    let datas = {
        text,
        id: msg.id
    }
    if (process && process.send) {
        process.send(datas);
    }
});





//图片文本识别
async function recognizeTextFromImage(imagePath: string): Promise<string> {

    // 检查路径是否存在并且是一个文件
    if (!(fs.existsSync(imagePath) && fs.statSync(imagePath).isFile())) {
        console.error(`文件不存在`);
        return 'Error';
    }

    try {
        const result = await Tesseract.recognize(
            imagePath,
            'chi_sim', // 使用简体中文
            {
                logger: (m) => console.log(m) // 可以选择性地记录进度
            }
        );
        let text = result.data.text;
        return text.replace(/\s+/g, '');  //去除空格
    } catch (error) {
        // console.error('OCR识别失败:', error);
        // throw error;
        console.log('error');
        return 'eooer'
    }
}