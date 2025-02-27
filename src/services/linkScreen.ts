import { getUrl } from '@/pathUtils';
import { createCanvas, registerFont } from 'canvas';  // 导入 canvas 模块
import fs from 'fs';  // 导入文件系统模块
import path from 'path';
// 使用Sharp库来处理图像
import sharp from 'sharp';

// const canvas = createCanvas(400, 300);
// 1. 创建画布时关闭抗锯齿（核心）
const canvas = createCanvas(400, 300); // 关键选项



const ctx = canvas.getContext('2d');

ctx.antialias = 'none'

// 2. 强制禁用图像平滑（额外保险）
ctx.imageSmoothingEnabled = false;
ctx.patternQuality = 'fast'; // 低质量渲染模式
ctx.textDrawingMode = 'path'; // 可选：强制用路径渲染文本（部分版本支持）

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 400, 300);

const fontPath = getUrl('root', 'assets/font/WenQuanYiBitmapSong16px.ttf');
// 字体面信息
const fontFace = {
    family: 'wenquan', // 字体家族名称，可以在绘图上下文中使用此名称来引用字体
    weight: 'normal',           // 字体重量，可选参数，默认为 'normal'
    style: 'normal'             // 字体样式，可选参数，默认为 'normal'，可以是 'italic' 或 'oblique'
};
registerFont(fontPath, fontFace);

export function getlinkScreen() {
    setName();
    text();

    touxian();

    img(3);

    date('2024-02-17 13:00');
    // 将绘制的图表保存为 PNG 图片
    const buffer = canvas.toBuffer('image/png');  // 将画布内容转换为 PNG 图片格式的缓冲区
    return buffer;
}

export function processImageForEInk(buffer: Buffer): number[] {
    // 固定墨水屏尺寸参数
    const SCREEN_WIDTH = 400;
    const SCREEN_HEIGHT = 300;
    const BITS_PER_BYTE = 8;
  
    // 验证输入数据长度 (假设输入为RGBA原始数据)
    const expectedLength = SCREEN_WIDTH * SCREEN_HEIGHT * 4; // RGBA每像素4字节
    if (buffer.length !== expectedLength) {
      throw new Error(`Invalid buffer length. Expected ${expectedLength}, got ${buffer.length}`);
    }
  
    // 计算每行字节数（400宽度需要50字节/行：400/8=50）
    const bytesPerRow = Math.ceil(SCREEN_WIDTH / BITS_PER_BYTE);
    const outputBuffer = new Uint8Array(bytesPerRow * SCREEN_HEIGHT);
  
    // 核心转换逻辑
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        // 计算原始缓冲区的像素位置（RGBA格式）
        const pixelIndex = (y * SCREEN_WIDTH + x) * 4;
        const [r, g, b, a] = [
          buffer[pixelIndex],
          buffer[pixelIndex + 1],
          buffer[pixelIndex + 2],
          buffer[pixelIndex + 3]
        ];
  
        // 二值化处理（考虑透明度）
        const isBlack = (a < 128) ? false : (r + g + b) / 3 < 128;
  
        // 计算目标字节位置（注意低位在前的位顺序）
        const byteX = Math.floor(x / BITS_PER_BYTE);
        const byteIndex = y * bytesPerRow + byteX;
        const bitPosition = 7 - (x % BITS_PER_BYTE); // 7- 实现低位在前
  
        // 设置对应位
        if (isBlack) {
          outputBuffer[byteIndex] |= (1 << bitPosition);
        }
      }
    }
  
    // 转换为普通数组以便JSON序列化
    return Array.from(outputBuffer);
  }

function setName() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'black';
    ctx.font = '22px wenquan';
    ctx.fillText('不爱吃糖', 71, 50);
}

function touxian() {
    ctx.fillStyle = 'black';
    ctx.fillRect(16, 13, 50, 50);
}

function img(line: number) {

    ctx.fillStyle = 'black';
    let h = 155;
    if (line == 1) {
        h = 121;
    }

    ctx.fillRect(35, h, 100, 100);
}

function text() {


    ctx.fillStyle = 'black';
    ctx.font = '18px wenquan';
    wrapTextByByte('今天终于完成了驾驶证考试，顺利获得了我的驾驶证！自己的努力，终于有了回报，未来的路，自己掌控！', 32, 85, 68, 25);

}

function date(dateStr: string) {
    ctx.fillStyle = 'black';
    ctx.font = '16px wenquan';
    ctx.fillText(dateStr, 269, 265);
}



function wrapTextByByte(text: string, x: number, y: number, maxByte: number, lineHeight: number) {
    let line = '';
    let currentByteLength = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const byteLength = Buffer.byteLength(char, 'utf8'); // 获取字符的字节长度

        if (currentByteLength + byteLength > maxByte) {
            // 如果当前行的字节数超过最大字节数，绘制当前行并换行
            ctx.fillText(line, x, y);
            line = char; // 新的一行从当前字符开始
            y += lineHeight; // 换行
            currentByteLength = byteLength; // 重置当前字节长度
        } else {
            line += char; // 添加字符到当前行
            currentByteLength += byteLength; // 累加字节长度
        }
    }

    ctx.fillText(line, x, y); // 绘制最后一行
}