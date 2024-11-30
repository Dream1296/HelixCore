import { spawn } from "child_process";
import fs from 'fs';
import path from "path";
//  ts-node -r tsconfig-paths/register src/test.ts

// sqlGetDtIndexAll().then(a => console.log(a));
// dtList('yw', 1).then(a => console.log(a[2]))
// getLongVideoList()

// getFile(31,9,0);

let fileSrc = '';
let paths = '/dream/HelixCore/assets/dtvideo/';
let nameArr = fs.readdirSync(paths);
async function main() {
    for (let a of nameArr) {
        fileSrc = paths + a;
        await ensureVideoIsMP4(fileSrc);
    }
}


main();


/**
 * 如果转换后的MP4文件不存在，进行视频转换并返回转换后的视频路径
 * @param inputPath 原始视频文件路径
 * @returns 转换后的视频文件路径
 */
async function ensureVideoIsMP4(inputPath: string): Promise<string> {
    // 定义输出路径，通过替换 /dtimg/ 为 /dtimgs/ 来构造
    const outputPath = inputPath.replace('/dtvideo/', '/dtvideos/');

    // 检查转换后的文件是否已经存在
    if (fs.existsSync(outputPath)) {
        console.log(`转换后的文件已经存在: ${outputPath}`);
        return outputPath;
    }

    // 确保输出目录存在，如果不存在则创建
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`正在转换视频: ${inputPath} -> ${outputPath}`);

    // 使用 ffmpeg 进行转换
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', inputPath,          // 输入文件路径
            '-c:v', 'libx264',        // 视频编码格式
            '-c:a', 'aac',            // 音频编码格式
            '-strict', 'experimental',// 允许使用实验性音频特性
            '-y',                     // 如果文件已存在，覆盖文件
            outputPath                // 输出文件路径
        ]);

        // 捕获 ffmpeg 的标准错误输出
        ffmpeg.stderr.on('data', (data) => {
            console.error('FFmpeg 错误输出:', data.toString());
        });

        // ffmpeg 处理完成后的回调
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log(`视频转换成功: ${outputPath}`);
                resolve(outputPath); // 返回转换后的文件路径
            } else {
                reject(new Error(`FFmpeg 进程退出，状态码: ${code}`)); // 转换失败
            }
        });

        // 错误处理
        ffmpeg.on('error', (err) => {
            reject(err); // 出现错误时拒绝Promise
        });
    });
};