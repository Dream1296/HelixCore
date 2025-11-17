import fs from "fs";
import path from "path";
import { exec } from "child_process";
import sharp from "sharp";

const RAW_EXT = new Set([
  "dng", "nef", "cr2", "cr3", "arw", "raf", "rw2", "pef", "orf"
]);

const tempDir = "/dream/HelixCore/assets/temp";

function execAsync(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * RAW → PNG（如果是 RAW），否则原样返回文件名
 * @param dirPath 图片所在目录（不含文件名）
 * @param fileName 图片文件名（含扩展名）
 * @returns 新文件名（若非 RAW 则返回原 fileName）
 */
export async function convertRawToPngIfNeeded(
  dirPath: string,
  fileName: string
): Promise<string> {

  // 判断后缀
  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  const isRaw = RAW_EXT.has(ext);

  if (!isRaw) {
    return fileName; // 非 RAW，直接返回
  }

  // 构造原图完整路径
  const inputPath = path.join(dirPath, fileName);

  if (!fs.existsSync(inputPath)) {
    throw new Error("文件不存在: " + inputPath);
  }

  // 输出 PNG 名字
  const outputFileName = fileName + ".png";
  const outputPath = path.join(dirPath, outputFileName);

  // 临时 tiff 放到固定 tempDir
  const base = path.basename(fileName, path.extname(fileName));
  const tempTiff = path.join(tempDir, base + ".temp.tiff");

  try {
    // 确保 tempDir 存在
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 删除旧临时 tif
    if (fs.existsSync(tempTiff)) {
      fs.unlinkSync(tempTiff);
    }

    // 1️⃣ dcraw 输出 TIFF 到 tempDir
    // 使用 -c 输出到 stdout，重定向到 tempTiff
    // 这样不依赖 dcraw 的 -O
    const cmd = `dcraw -T -6 -W -c "${inputPath}" > "${tempTiff}"`;
    await execAsync(cmd);

    if (!fs.existsSync(tempTiff)) {
      throw new Error("dcraw 未生成 TIFF 文件");
    }

    // 2️⃣ TIFF → PNG
    await sharp(tempTiff)
      .png({ compressionLevel: 0 })  // 尽量无损
      .toFile(outputPath);

    return outputFileName;

  } finally {
    // 删除 TIFF
    if (fs.existsSync(tempTiff)) {
      fs.unlinkSync(tempTiff);
    }
  }
}
