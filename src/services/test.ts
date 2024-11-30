import { createCanvas } from 'canvas';
import fs from 'fs';

// 创建画布
const canvas = createCanvas(1920, 660);
const ctx = canvas.getContext('2d');

// 设置背景填充为白色
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 设置文本样式，指定支持中文的字体
ctx.fillStyle = 'black';
ctx.font = '36px "Noto Sans CJK"';  // 使用 Noto Sans CJK 字体

// 绘制测试文本
ctx.fillText('测试文本', 100, 100);  // 绘制中文文本
ctx.fillText('Dynamic Submit Records', 850, 150);  // 绘制英文文本

// 进一步调试：绘制其他样式的文本
ctx.font = '24px "Noto Sans CJK"';  // 改变字体大小
ctx.fillText('This is a test!', 100, 200);

// 保存为 PNG 文件
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./drawing.png', buffer);

console.log('图像已保存为 drawing.png！');
