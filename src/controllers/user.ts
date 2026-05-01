import { getPasswd } from '../models/login'
import express, { Request, Response } from 'express';
import { Reqs } from '../type';
import { getUser } from '../services/token';
import { userIn as userIns, userImgUrl, setMoodM } from '../models/user';
import path from 'path'
import fs from 'fs';
import { getUrl } from '@/pathUtils';
import moment from 'moment';

async function userClass(req: Reqs, res: Response) {
    res.send({
        code: 200,
        data: {
            username: req.user?.username,
        }
    });
}

async function userIn(req: Reqs, res: Response) {
    let userId = req.user?.username;
    if (!userId) userId = process.env.Guest as string;
    let user = await userIns(userId);
    if (!user) {
        res.send(  userIns(process.env.Guest!) )
    }else{
        res.send(user)
    }
}

async function userImg(req: Reqs, res: Response) {

    let userId = req.query.userId?.toString() || process.env.Guest!;
    let url = await userImgUrl(userId);
    if (url == undefined) {
        return res.send({
            code: 400,
        })
    }
    url = getUrl('public', 'userImg', url);

    console.log(url);
    
    let data = fs.readFileSync(url);
    res.setHeader('Content-Type', 'image/png');
    res.send(data);
}

export async function setMood(req: Reqs, res: Response) {
    let user = req.user?.username || "guest";
    let mood = req.body.mood;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!mood) {
        return res.send({
            code: 400,
            tf: 0,
        })
    }

    let h = await setMoodM(user, date, mood);
    if (h == 1) {
        return res.send({
            code: 200,
            tf: 1
        })
    }
    res.send({
        code: 400,
        tf: 0
    })

}

export { userClass, userIn, userImg }