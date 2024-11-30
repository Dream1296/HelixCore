import express, { NextFunction, Request, Response } from 'express';
import { Reqs } from '../type';
import { getUser } from '../services/token';
import { getDtUser } from '@/models/dt';
const apps1 = express();

//图片视频

async function loas(req:Reqs, res:Response,next:NextFunction ){
    let paths = ['/api/dtimg','/api/dtvideo','/api/dtvideoImg'];
    if(!paths.includes(req.path)){
        return next();
    }

    let Reqdtid = req.query.dtid;
    let dtid;
    if (Reqdtid) {
        dtid = Number(Reqdtid);
    } else {
        return res.send({ code: 402 });
    }
    let userObj = await getDtUser(dtid);    
    if( !(userObj[0].loa == 0 || userObj[0].user == req.user?.username)){
        return res.send({code:401});
    }

    next();
    
    
}

apps1.use(loas);

export {apps1};