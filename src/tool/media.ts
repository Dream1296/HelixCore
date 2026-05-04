import { getUrl } from "@/pathUtils";
import path from "path";
import { fileIsDir } from "./filePath";
import { execSync, spawn } from "child_process";

//传入一个视频数组，判断视频是否为h254，如果不是在指定目录生成h254编码视频
export async function ensureVideoIsh254(videoArr: string[]) {
    let video_src = process.env.aNew as string;
    let videoSrcOriginal = path.join(getUrl('assets'), 'a', video_src, 'video/original');
    let videoSrcCompressed = path.join(getUrl('assets'), 'a', video_src, 'video/compressed');
    for (let inputPath of videoArr) {
        let videoUrl = path.join(videoSrcOriginal, inputPath);
        // 用 ffprobe 检查视频编码
        if (!fileIsDir(videoSrcOriginal, inputPath)) {
            console.log('视频不存在');
            continue;
        }
        const codecInfo = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 ${videoUrl}`).toString().trim();
        const audioInfo = execSync(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 ${videoUrl}`).toString().trim();

        let args;
        if (codecInfo === 'h264' && audioInfo === 'aac') {
            console.log('视频为h254格式');
            continue;
        }
        let outputPath = path.join(videoSrcCompressed, inputPath);
        let inputPathSrc = path.join(videoSrcOriginal, inputPath);
        // 否则强制转码
        args = ['-i', inputPathSrc, '-c:v', 'libx264', '-c:a', 'aac', '-y', outputPath];
        await new Promise<void>((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', args);

            // 捕获 ffmpeg 的标准错误输出
            ffmpeg.stderr.on('data', (data) => {
                console.error('FFmpeg输出:', data.toString());
            });

            // ffmpeg 处理完成后的回调
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log(`视频转换成功: ${outputPath}`);
                    resolve();
                } else {
                    console.log('转换失败');
                    reject(new Error(`FFmpeg 进程退出，状态码: ${code}`)); // 转换失败
                }
            });

            // 错误处理
            ffmpeg.on('error', (err) => {
                console.log("错误");
                reject(err);
            });
        });
    }

}
