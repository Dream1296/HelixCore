import express, { NextFunction, Request, Response } from 'express';
import { Reqs } from '../type';
import { getUser } from '../services/token';
const apps = express();


function setToken(req:Reqs, res:Response,next:NextFunction ){
    
        // 获取 Authorization 头部中的 token
        let token;
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1]
        } else if(req.query.token){
            token = req.query.token
        }else{
            token = ''
        }
        
    
        const decryptedObject = getUser(token as string );
        
        req.user = {
            username:decryptedObject.user_id,
            dtid:decryptedObject.dtid,
            type:decryptedObject.type,
        };
        
        next();
}

apps.use(setToken);

export {apps};