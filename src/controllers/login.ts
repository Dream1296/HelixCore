import { getPasswd } from '../models/login'
import express, { Request, Response } from 'express';
const md5 = require('../utils/md5.min.js');
import { generateToken }  from '../services/token';


async function login(req:Request, res:Response){

    const username = req.body.username;
    let passwd = req.body.passwd as string;

    
    if(!username || !passwd){
        return res.send( {
            code:400,
            message:"请求内容不完整",
        });
    }
    

    let passwds =  await getPasswd(username)
    passwd = md5(passwd);
    if(passwd == passwds){
        //生成token
        const token = generateToken(username);
        return res.send( {
            code:'200',
            message:'OK',
            token,
        });
    }else{
        return res.send({
            code:'401',
            message:'账号或密码错误'
        });
    }
    
}

export default login