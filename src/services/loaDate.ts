
import moment from 'moment';
import { prisma } from '../config/prisma';

import fs from 'fs';

// 获取距离上次的时间
export async function getLoaDate() {
    const dateEnd = await prisma.dt_date.findFirst({
        orderBy: {
            id: 'desc', // 按 id 倒序
        },
    });
    if (!dateEnd) {
        return {
            d: -1,
            h: -1
        };
    }
    let now = Date.now() + 8 * 60 * 60 * 1000;
    let old = new Date(dateEnd.date).getTime();
    let s = Math.floor((now - old) / 1000);
    let d = Math.floor(s / (60 * 60 * 24));
    let h = Math.floor((s % (60 * 60 * 24)) / (60 * 60));
    return { d, h }
}

//添加新时间
export async function setLoaDate() {
    let now = (new Date()).getTime() + 8 * 60 * 60 * 1000;
    await prisma.dt_date.create({
        data: {
            date: (new Date(now)).toISOString(),
        }
    });
    fs.writeFileSync('/usr/games/ahda2.txt', Math.floor((new Date()).getTime() / 1000).toString() + "\n")
}

