import { getUrl } from '@/pathUtils';
import { dbSql } from '@/utils/dbSql';
import sharp from 'sharp';

let arrBlack: number[] = [];

let arrRed: number[] = [];

let numBlack = 0;
let i = 0;
let numRed = 0;

function addxs(r: number, g: number, b: number) {
    let a = getColorCategory(r, g, b);
    if (a === 0) {
        add(0, 0)
    }
    if (a === 1) {
        add(1, 0);
    }
    if (a === 2) {
        add(0, 1);
    }
}

/**
 * 
 * @param a 黑色
 * @param b 红色
 */
function add(a: number, b: number) {
    numBlack <<= 1;
    numRed <<= 1;
    numBlack += a;
    numRed += b;
    i++;
    if (i == 8) {
        arrBlack.push(numBlack);
        arrRed.push(numRed);
        numBlack = 0;
        i = 0;
        numRed = 0;
    }

}

/**
 * 
 * @param imagePath 图片地址或图片数据
 * @returns {blackArr,redArr}黑色和红色点阵数组
 */
// 定义一个函数，传入图片路径
export async function processImage(imagePath: string | Buffer) {
    try {
        let images = await processImage_a(imagePath);
        if(!images){
            return false;
        }

        // 加载图片并获取其元数据
        const image = sharp(images);
        const metadata = await image.metadata();
        // 获取图片的宽度和高度
        const width = metadata.width!;
        const height = metadata.height!;
        // 遍历图片的每一行
        for (let y = 0; y < height; y++) {
            // 创建新的 sharp 实例，避免在循环中重复使用原始实例
            const currentImage = sharp(images);
            // 提取当前行的像素数据
            const row = await currentImage.extract({ left: 0, top: y, width: width, height: 1 }).raw().toBuffer();

            // 遍历当前行的每个像素
            for (let x = 0; x < width; x++) {
                // 每个像素包含红、绿、蓝值 (通常为RGB格式)
                const r = row[x * 4];     // 红色
                const g = row[x * 4 + 1]; // 绿色
                const b = row[x * 4 + 2]; // 蓝色
                addxs(r, g, b);

            }
            //换行操作
            arrBlack.push(numBlack);
            arrRed.push(numRed);
            numBlack = 0;
            i = 0;
            numRed = 0;

        }
    } catch (error) {
        console.error('Error processing image:', error);
    }

    return {
        blackArr: arrBlack,
        redArr: arrRed
    }
}

async function processImage_a(imageInput:string | Buffer) {
    try {
      // 如果传入的是文件路径，使用 sharp 读取文件，否则直接使用 buffer
      const image = typeof imageInput === 'string' 
        ? sharp(imageInput)  // 如果是路径
        : sharp(imageInput); // 如果是 Buffer
  
      // 获取图片的元数据
      const metadata = await image.metadata();
      const { width, height } = metadata;
  
      // 如果图片已经是 300x400，直接返回原始图片的 Buffer
      if (width === 300 && height === 400) {
        const buffer = await image.toBuffer();
        return buffer;
      }
  
      // 如果图片是 400x300，进行逆时针旋转 90 度，并检查旋转后的尺寸
      if (width === 400 && height === 300) {
        const rotatedImage = await image
          .rotate(-90)  // 逆时针旋转 90 度
          .resize(300, 400)  // 调整为 300x400
          .toBuffer();  // 获取图片的 Buffer
  
        // 返回旋转后的图片的 Buffer
        return rotatedImage;
      }
  
      // 如果都不是期望的尺寸，返回 false
      return false;
    } catch (err) {
      console.error('Error processing image:', err);
      return false;
    }
  }


/**
 * 
 * @param blackArr 黑色点阵数组
 * @param redArr 红色点阵数组
 * @returns 是否成功
 */
export async function addDB(blackArr: number[], redArr: number[]) {
    const blackArrBuffer = Buffer.from(blackArr.flat());  // flatten 数组并转换为 Buffer
    const redArrBuffer = Buffer.from(redArr.flat());  // flatten 数组并转换为 Buffer
    let sql = "INSERT INTO dt_Ink_screen (black,red) VALUES (?,?)";
    return await dbSql(sql, [blackArrBuffer, redArrBuffer]);
}

function getColorCategory(r: number, g: number, b: number) {
    // 模糊判断阈值
    const COLOR_THRESHOLD = 30; // 偏差范围，例如允许 ±30

    // 计算与目标颜色的“接近度”
    const getColorDistance = (targetR: number, targetG: number, targetB: number) => {
        return Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2));
    };

    // 精确匹配判断
    if (r === 255 && g === 255 && b === 255) {
        return 0; // 白色
    }
    if (r === 0 && g === 0 && b === 0) {
        return 1; // 黑色
    }
    if (r === 255 && g === 0 && b === 0) {
        return 2; // 红色
    }

    // 计算与白色、黑色和红色的距离
    const whiteDistance = getColorDistance(255, 255, 255);
    const blackDistance = getColorDistance(0, 0, 0);
    const redDistance = getColorDistance(255, 0, 0);

    if (blackDistance <= redDistance) {
        if (blackDistance < whiteDistance) {
            return 1;
        }
    } else {
        // if (redDistance < whiteDistance) {
        //     return 2
        // }
    }

    return 0;


    // // 如果有接近的颜色（在阈值范围内），返回相应的值
    // if (whiteDistance <= COLOR_THRESHOLD) {
    //     return 0; // 白色
    // }
    // if (blackDistance <= COLOR_THRESHOLD) {
    //     return 1; // 黑色
    // }
    // if (redDistance <= COLOR_THRESHOLD) {
    //     return 2; // 红色
    // }

    // // 返回最接近的颜色
    // if (whiteDistance < blackDistance && whiteDistance < redDistance) {
    //     return 0; // 白色
    // }
    // if (blackDistance < whiteDistance && blackDistance < redDistance) {
    //     return 1; // 黑色
    // }
    // return 2; // 红色
}

// 示例：传入 RGB 值，返回对应的颜色类别
const r = 250, g = 0, b = 0; // 红色（稍微偏差）
const colorCategory = getColorCategory(r, g, b);
console.log(`Color Category: ${colorCategory}`); // 输出 2 (红色)

const r2 = 200, g2 = 200, b2 = 200; // 接近白色
const colorCategory2 = getColorCategory(r2, g2, b2);
console.log(`Color Category: ${colorCategory2}`); // 输出 0 (白色)



