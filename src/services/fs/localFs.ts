const nullFileDbPath = process.env.nullFileDbPath ?? '-1';
const nullFileDbName = process.env.nullFileDbName ?? '-1';
const showProportion = process.env.showProportion ?? '-1';
// 上传空文件占位
export async function upNullFile(type: 'img' | 'video', dtId: string, index: number, fileMd5: string) {
    if (type === 'img') {
        return await prisma?.dt_img.create({
            data: {
                dt_id: dtId,
                img_index: index,
                img_src: nullFileDbPath,
                img_name: nullFileDbName,
                show_proportion: showProportion,
                md5: fileMd5,
                size: 0,
            }
        })
    }
    if (type === 'video') {
        return await prisma?.dt_video.create({
            data: {
                dt_id: dtId,
                video_index: index,
                video_src: nullFileDbPath,
                video_name: nullFileDbName,
                show_proportion: showProportion,
                md5: fileMd5,
                size: 0,
            }
        })
    }
}

// 从数据库中查看文件是否存在过
export async function upRepeatFile(type: 'img' | 'video', dtId: string, index: number, fileMd5: string) {
    if (type === 'img') {
        let exFileRow = await prisma?.dt_img.findMany({
            select: {
                img_src: true,
                img_name: true,
                size: true
            },
            where: {
                md5: fileMd5,
            }
        })

        if (exFileRow && exFileRow.length > 0) {
            let exFile = exFileRow[0];
            return await prisma?.dt_img.create({
                data: {
                    dt_id: dtId,
                    img_index: index,
                    img_src: exFile.img_src,
                    img_name: exFile.img_name,
                    show_proportion: '4/3',
                    md5: fileMd5,
                    size: exFile.size
                }
            })
        }
    }
    if (type === 'video') {
        let exFileRow = await prisma?.dt_video.findMany({
            select: {
                video_src: true,
                video_name: true,
                size: true
            },
            where: {
                md5: fileMd5,
            }
        })

        if (exFileRow && exFileRow.length > 0) {
            let exFile = exFileRow[0];
            return await prisma?.dt_video.create({
                data: {
                    dt_id: dtId,
                    video_index: index,
                    video_src: exFile.video_src,
                    video_name: exFile.video_name,
                    show_proportion: '4/3',
                    md5: fileMd5,
                    size: exFile.size
                }
            })
        }
    }

    return null;
}