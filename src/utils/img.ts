import sharp from 'sharp';

async function imgCompression(imgPath:string,x:number,y:number){
    return new Promise<Buffer>((resolve,rejects)=>{
        sharp(imgPath)
        .resize(x, y, {
            fit: 'inside', // 保持图片的比例
            withoutEnlargement: true // 防止放大图片
        })
        .toBuffer()
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            rejects(err);
        });
    })
}

export {imgCompression}