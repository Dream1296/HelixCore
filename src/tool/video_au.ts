import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { getUrl } from '@/pathUtils';
import path from 'path';
import fs from 'fs';
import { socketRequest } from '@/tool/socketReq';
import { dbSql } from '@/utils/dbSql';

interface Subtitle {
    cout: number;
    time_start: number;
    time_end: number;
    text: string;
}



async function test() {
    // 从数据库中获取视频信息
    const dyDtList = await prisma.dt.findMany({
        select: {
            id: true,
            video_num: true,
        },
        where: {
            user: 'dy',
            video_num: {
                gt: 0,
            }
        },
    });

    const dyDtIdArr = dyDtList.map(item => {
        return {
            id: item.id,
            video_num: item.video_num,
        }
    });

    let cout1 = 0;
    for (let dtInfo of dyDtIdArr) {
        console.log(`正在运行${cout1++} / ${dyDtIdArr.length}`);
        
        for (let index = 0; index < dtInfo.video_num; index++) {

            // 查询该id+index是否有写入过
            let sql = "SELECT * FROM `dt_video_text` where dt_id = ? and dt_index = ? ";
            if((await dbSql<any[]>(sql, [dtInfo.id, index],undefined,'ai')).length != 0){
                continue;
            }

            let videoAuBuffer = await getVideoAu(dtInfo.id, index);;
            
            let text = await fn1(videoAuBuffer.data);
            
            let a = parseSRT(text);
            for (let cout = 0; cout < a.length; cout++) {
                let sql = "INSERT INTO `dt_video_text` ( `dt_id`, `dt_index`, `cout`, `time_start`, `time_end`, `text`) VALUES (?,?,?,?,?,?);"
                await dbSql(sql, [dtInfo.id, index, a[cout].cout, a[cout].time_start, a[cout].time_end, a[cout].text], undefined, 'ai');
            }
        }
    }


}




export function parseSRT(srt: string): Subtitle[] {
    try {
        if (typeof srt !== "string" || !srt.trim()) {
            return [];
        }

        const blocks = srt.trim().split(/\r?\n\r?\n/);

        const result: Subtitle[] = [];

        for (let i = 0; i < blocks.length; i++) {
            const lines = blocks[i].split(/\r?\n/);

            // 至少需要：序号、时间、正文
            if (lines.length < 3) {
                return [];
            }

            // 第一行必须是数字序号
            if (!/^\d+$/.test(lines[0].trim())) {
                return [];
            }

            // 第二行必须是：
            // 00:00:00,000 --> 00:00:02,780
            const timeMatch = lines[1].match(
                /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/
            );

            if (!timeMatch) {
                return [];
            }

            const time_start = timeToMs(timeMatch[1]);
            const time_end = timeToMs(timeMatch[2]);

            // 时间必须合法
            if (time_start < 0 || time_end < 0 || time_start > time_end) {
                return [];
            }

            // 正文不能为空
            const text = lines.slice(2).join("\n").trim();

            if (!text) {
                return [];
            }

            result.push({
                cout: i,
                time_start,
                time_end,
                text
            });
        }

        return result;
    } catch {
        return [];
    }
}

function timeToMs(time: string): number {
    const match = time.match(
        /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/
    );

    if (!match) {
        return -1;
    }

    const [, h, m, s, ms] = match;

    const hours = Number(h);
    const minutes = Number(m);
    const seconds = Number(s);
    const milliseconds = Number(ms);

    // 防止出现 99:99:99,999 这种格式
    if (
        minutes >= 60 ||
        seconds >= 60 ||
        milliseconds >= 1000
    ) {
        return -1;
    }

    return (
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000 +
        milliseconds
    );
}


async function getVideoAu(dtid: number, index: number) {
    let url = '/video/getVideoAudio?dtid=' + dtid + '&index=' + index;
    // 获取视频音频
    let videoAuBuffer = await socketRequest<ArrayBuffer>('fs', url, 'GET', null, 'buffer');
    return videoAuBuffer;
}


function fn1(videoAuBuffer: ArrayBuffer) {
    return fetch('http://192.168.1.2:8805/au', {
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        method: 'POST',
        body: videoAuBuffer,
    })
        .then(res => res.text())
        .then(data => {
            return data;
        })
}

test();


