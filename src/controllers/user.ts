import { getPasswd } from '../models/login'
import express, { Request, Response } from 'express';
import { Reqs } from '../type';
import { getUser }  from '../services/token';
import { userIn as userIns , userImgUrl} from '../models/user';
import path from 'path'
import fs from 'fs';
import { getUrl } from '@/pathUtils';

async function userClass(req:Reqs, res:Response){
    res.send(req.user?.username);
}

async function userIn(req:Reqs, res:Response){
    let userId = req.user?.username;
    if (!userId) userId = 'a';
    let user = await userIns(userId)
    
    
    res.send(user)
}

async function userImg(req:Reqs, res:Response){
    let name = req.query.name || 'guest';
    let url = (await userImgUrl(name as string) as {touxian:string}).touxian ;;
    
    // url = path.join(__dirname,'../../public/userImg',url);
    url = getUrl('root','public/userImg',url);


    let data = fs.readFileSync(url);
    res.setHeader('Content-Type','image/png');
    res.send(data);
}

export {userClass,userIn,userImg}