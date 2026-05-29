import { spawn } from "child_process";
import fs from "fs";

const FFMPEG_PATH = "/dream/HelixCore/src/dev/ffmpeg/ffmpeg";

/**
 * RK3588 硬件加速转 H264
 */
export function transcodeToH264(
    inputPath: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputPath)) {
            reject(new Error(`输入文件不存在: ${inputPath}`));
            return;
        }
        const args = [

            "-y",

            // RKMPP硬解
            "-hwaccel", "rkmpp",

            // DRM PRIME 零拷贝
            "-hwaccel_output_format", "drm_prime",

            // 输入文件
            "-i", inputPath,

            // RKMPP H264硬编码
            "-c:v", "h264_rkmpp",

            // 音频AAC
            "-c:a", "aac",

            outputPath
        ];

        const ffmpeg = spawn(FFMPEG_PATH, args);

        ffmpeg.stderr.on("data", (data) => {
            console.log(data.toString());
        });

        ffmpeg.on("error", (err) => {
            reject(err);
        });

        ffmpeg.on("close", (code) => {

            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`FFmpeg退出，code=${code}`));
            }

        });

    });

}





/**
 * 获取视频编码格式
 */
export function getVideoCodec(
    videoPath: string
): Promise<"h264" | "h265"> {

    return new Promise((resolve, reject) => {

        if (!fs.existsSync(videoPath)) {
            return reject(
                new Error(`文件不存在: ${videoPath}`)
            );
        }

        const args = [
            "-i",
            videoPath
        ];

        const ffmpeg = spawn(FFMPEG_PATH, args);

        let output = "";

        // ffmpeg 信息基本都在 stderr
        ffmpeg.stderr.on("data", (data) => {
            output += data.toString();
        });

        ffmpeg.on("error", (err) => {
            reject(err);
        });

        ffmpeg.on("close", () => {

            const lowerOutput = output.toLowerCase();

            console.log(lowerOutput);
            
            // h265 / hevc
            if (
                lowerOutput.includes("video: hevc") ||
                lowerOutput.includes("video: h265")
            ) {
                return resolve("h265");
            }

            // h264
            if (
                lowerOutput.includes("video: h264")
            ) {
                return resolve("h264");
            }

            reject(
                new Error("无法识别视频编码格式")
            );

        });

    });

}