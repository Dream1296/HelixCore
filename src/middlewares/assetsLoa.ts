import { NextFunction, Response } from 'express';
import { Reqs } from '../type';
 

export async function loas(req: Reqs, res: Response, next: NextFunction) {

    // 需要鉴权的接口
    const onlyYwPaths = new Set([
        '/api/getChatNode',
        '/api/listPath',
        '/api/listImgT',
        '/api/listImg',
        // '/api/listVideo',
        '/api/setBgStyle',
        '/api/updt',
        '/api/upvideo',
        '/api/postdt',
        '/api/setDt',
        '/api/dtvideoImg',
        '/api/linkScreenControl',
        '/api/keepOcr',

        '/api/bookrdata',
        '/api/bookvdata',
        '/api/bookau',
        '/api/booklist',
        '/api/bookcover',
        '/api/bookjd',

    ]);

    const loginPaths = new Set([
        '/api/setShare',
        '/api/gps',
    ]);

    const username = req.user?.username;
    const isLogin = !!username && username !== process.env.Guest;
    // console.log(username);
    
    if (onlyYwPaths.has(req.path) && username == process.env.Guest) {
        return res.status(403).json({ code: 403, message: '未授权的访问1' });
    }

    if (loginPaths.has(req.path) && !isLogin) {
        return res.status(401).json({ code: 401, message: '请先登录' });
    }

    return next();
}
