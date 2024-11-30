import { createCanvas } from 'canvas';  // 导入 canvas 模块
import fs from 'fs';  // 导入文件系统模块

let startXY = { x: 100, y: 200 };

const canvas = createCanvas(1920, 660);

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 1920, 660);


let arr: number[] 

export function getDtDataImg(title:string, data:string[]) {
    ctx.fillStyle = 'black';


    // 获取数据数组
     arr = getDataArr(data);

    // 绘制图形和文本
    setDiv();
    setText(title);

    // 将绘制的图表保存为 PNG 图片
    const buffer = canvas.toBuffer('image/png');  // 将画布内容转换为 PNG 图片格式的缓冲区
    return buffer;
    // fs.writeFileSync('./drawing.png', buffer);  // 将图片保存到本地



    // console.log('图像已保存为 drawing.png！');

}






// 设置文本的函数
function setText(title: string): void {
    // ctx.font = '20px "SimHei"';
    ctx.fillStyle = 'black';
    ctx.font = '20px "Noto Sans CJK"';
    let monArr: string[] = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    let monStart = { x: 110, y: 210 };
    let monjiange = 145;

    // 绘制月份名称
    for (let i = 1; i <= 12; i++) {
        ctx.fillText(monArr[i], monStart.x, monStart.y);
        monStart.x += monjiange;
    }

    // 绘制星期信息
    ctx.fillText('周一', 55, 245);
    ctx.fillText('周三', 55, 310);
    ctx.fillText('周六', 55, 409);

    // 设置标题字体和绘制标题
    ctx.font = '36px "SimHei"';
    ctx.fillText(title, 850, 150);
}

// 设置方块绘制的函数
function setDiv(): void {
    let temp = { x: startXY.x, y: startXY.y };
    let len = 0;
    let time = 50;
    let a = 22.5;
    let marginLen = 4.5;

    // 遍历数据并绘制方块
    for (let c of arr) {
        let color = 'rgb(255,255,255)';
        if (c == 0) {
            color = 'rgb(255,255,255)';
        }
        if (c == 1) {
            color = 'rgb(235,237,240)';
        }
        if (c > 1) {
            color = 'rgb(155,233,168)';
        }

        // 换行逻辑
        if (len == 7) {
            temp.x += a + marginLen * 2;
            temp.y -= (a + marginLen * 2) * 6;
            len = 0;
        } else {
            temp.y += a + marginLen * 2;
        }

        let x = temp.x;
        let y = temp.y;

        // 使用 setTimeout 来异步绘制
        // setTimeout(() => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, a, a);
        // }, time);

        time += 50;
        len++;
    }
}

// 获取日期数据数组并填充
function getDataArr(data: string[]): number[] {
    let arr: number[] = new Array(371).fill(0); // 初始化一个有 371 个元素的数组（包括闰年的 366 天）

    const year = 2024;
    let headDay = new Date(year, 0, 1).getDay() - 1; // 获取第一天的星期几

    // 如果是周日，则转换为周六（0转换为6）
    headDay = headDay === -1 ? 6 : headDay;

    let yaerNum = isLeapYear(year) ? 366 : 365; // 判断是否为闰年

    // 填充日期数据
    for (let i = headDay; i < yaerNum; i++) {
        arr[i] += 1;
    }

    // 根据传入的日期数据进一步填充
    for (let d of data) {
        let ymd = d.split(',');
        let index = headDay + dayOfYear(Number(ymd[0]), Number(ymd[1]), Number(ymd[2]) - 1);
        arr[index] += 1;
    }

    return arr;
}

// 判断是否为闰年
function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 计算指定日期是该年份的第几天
function dayOfYear(year: number, month: number, day: number): number {
    const daysInMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // 判断闰年
    if (isLeapYear(year)) {
        daysInMonth[1] = 29; // 闰年 2 月有 29 天
    }

    // 计算该日期是该年中的第几天
    let dayOfYear = 0;
    for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
    }
    dayOfYear += day;

    return dayOfYear;
}







