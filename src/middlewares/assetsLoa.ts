import express, { NextFunction, Request, Response } from 'express';
import { Reqs } from '../type';
import { getUser } from '../services/token';
import { getDtUser } from '@/models/dt/dt';


//图片视频

export async function loas(req: Reqs, res: Response, next: NextFunction) {
    // 仅个人可以访问的
    const chatRo = ['getChatNode'];
    const listRo = ['listPath', 'listImgT', 'listImg', 'listVideo'];
    //对路径合并并加前缀
    let paths = [...chatRo, ...listRo].map(i => '/api/' + i);
    if (paths.includes(req.path) && req.user?.username != 'yw') {
        return res.status(403).json({ code: 403, message: '未授权的访问1' });
    }



    return next();
    // let paths = ['/api/dtimg', '/api/dtvideo', '/api/dtvideoImg'];
    // if (!paths.includes(req.path)) {
    //     return next();
    // }

    // let Reqdtid = req.query.dtid;
    // let dtid;
    // if (Reqdtid && Reqdtid != 'undefined') {
    //     dtid = Number(Reqdtid);
    // } else {
    //     return res.send({ code: 402 });
    // }
    // let userObj = await getDtUser(dtid);
    // console.log(userObj);

    // if (!(userObj.length != 0 && userObj[0].loa != 0 && userObj[0].user != req.user?.username)) {
    //     return res.send({ code: 401 });
    // }

    // next();


}

