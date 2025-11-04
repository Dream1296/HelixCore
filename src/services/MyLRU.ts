import { LRUCache } from 'lru-cache';
import fs from 'fs';
import { getRedisListData, getVideoSrc } from '@/models/dt/dt';
import { dbSql } from '@/utils/dbSql';
import fsPromises from 'fs/promises';
import path from 'path';
import { getUrl } from '@/pathUtils';
import { Lists } from '@/type';

const thumbnailCache = new LRUCache<string, Buffer>({
    maxSize: 100 * 1024 * 1024, // 限制总共100MB
    sizeCalculation: (value, key) => value.length, // 返回每个条目的字节数
    ttl: 0, // 不自动过期
    noDisposeOnSet: true, // 不在覆盖旧值时触发dispose
    allowStale: false, // 不允许返回已被标记为过期的值
    updateAgeOnGet: true, // 访问后刷新LRU顺序
});

export async function ThumbnailInit(loa1Num: number, loa13: number) {




    //从redis中获取主数据
    let listData1 = (await getRedisListData('yw', 1, 0)).slice(0, loa1Num);
    await a(listData1);
    let listData13 = (await getRedisListData('yw', 13, 0)).slice(0, loa13);
    await a(listData13);
    let allSize = Math.floor(thumbnailCache.calculatedSize / 1024 / 1024);
    console.log(`已经完成图片视频视频封面缩略图的缓存，共${thumbnailCache.size},总大小：${allSize}`);
}

async function a(listData: Lists[]) {
    for (let dt of listData) {
        let imgNum = dt.imgShowAll;
        for (let i = 0; i < imgNum; i++) {
            //图片
            let sqlStr = `SELECT img_src,img_name FROM dt_img WHERE dt_id = ${dt.id} AND img_index = ${i};`
            let imgSrc = (await dbSql<{ img_src: string, img_name: string }[]>(sqlStr))[0];
            let urls = path.join(getUrl('assets'));
            let img_log = path.join(urls, 'a', imgSrc.img_src, 'img/compressed');
            let imgSrc1 = path.join(img_log, imgSrc.img_name);
            let imgData = await fsPromises.readFile(imgSrc1);
            // console.log(imgSrc1);
            
            setThumbnail(imgSrc1, imgData);

        }
        for (let i = 0; i < dt.videoShowAll; i++) {
            let file = await getVideoSrc(dt.id, i);
            if (!file) {
                continue;
            }
            let videoUrl = path.join(getUrl('assets'), 'a', file.video_src, 'video/');

            //视频预览图名字
            let videoImg = file.video_name.slice(0, -4) + '.png';

            let videoSrc = path.join(videoUrl, 'cover');

            let VideoCoverSrc = path.join(videoSrc, videoImg);
            let imgData = await fsPromises.readFile(VideoCoverSrc);
            setThumbnail(VideoCoverSrc, imgData);
        }
    }
}


export function getThumbnail(filePath: string) {
    const cached = thumbnailCache.get(filePath);
    if (cached) {
        return cached
    };
    return false;
}

export async function setThumbnail(path: string, buf: Buffer) {
    thumbnailCache.set(path, buf);
}


