import { socketRequest } from '@/tool/socketReq';




export async function getlinkScreen(id: number, name: string, content: string, date: string) {
   return socketRequest<Buffer>('/canvas/getlinkScreen','POST',{id,name,content,date},'buffer');
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
