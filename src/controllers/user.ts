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
    res.send(req.user?.username);
}

async function userIn(req: Reqs, res: Response) {    
    let userId = req.user?.username;
    if (!userId) userId = 'a';
    let user = await userIns(userId)

    res.send(user)
}

async function userImg(req: Reqs, res: Response) {
    let name = req.query.name || 'guest';
    let url = (await userImgUrl(name as string) as { touxian: string }).touxian;;
    if(url == undefined){
        return res.send({
            code:400,
        })
    }
    // url = path.join(__dirname,'../../public/userImg',url);
    url = getUrl('public', 'userImg', url);


    let data = fs.readFileSync(url);
    res.setHeader('Content-Type', 'image/png');
    res.send(data);
}

export async function setMood(req: Reqs, res: Response) {
    let user = req.user?.username || "guest";
    let mood = req.body.mood;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    if(!mood){
        return res.send({
            code:400,
            tf:0,
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