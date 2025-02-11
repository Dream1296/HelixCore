import sharp from 'sharp';

async function imgCompression(imgPath: string, x: number, y: number, savePath?: string) {
    return new Promise<Buffer>((resolve, reject) => {
        sharp(imgPath)
            .resize(x, y, {
                fit: 'inside', // 保持图片的比例
                withoutEnlargement: true // 防止放大图片
            })
            .toBuffer()
            .then(async (data) => {
                if (savePath) {
                    // 如果提供了保存路径，则保存压缩后的图片
                    try {
                        await sharp(data).toFile(savePath);
                    } catch (err) {
                        reject(`保存文件失败: ${err}`);
                    }
                }
                resolve(data);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export { imgCompression };
