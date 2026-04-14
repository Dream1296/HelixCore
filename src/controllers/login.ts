import { getPasswd, registerWrite } from '../models/login'
import express, { Request, Response } from 'express';
const md5 = require('../utils/md5.min.js');
import { generateTempToken, generateToken } from '../services/token';
import { Reqs } from '@/type';

// 登录
export async function login(req: Request, res: Response) {

    const username = req.body.username;
    let passwd = req.body.passwd as string;


    if (!username || !passwd) {
        return res.send({
            code: 400,
            message: "请求内容不完整",
        });
    }

    let passwds = await getPasswd(username)
    passwd = md5(passwd);
    if (passwd == passwds) {
        //生成token
        const token = generateToken(username);
        return res.send({
            code: '200',
            message: 'OK',
            token,
        });
    } else {
        return res.send({
            code: '401',
            message: '账号或密码错误'
        });
    }

}

// 注册
export async function register(req: Reqs, res: Response) {
    const username = req.body.username;
    let passwd = req.body.passwd as string;
    if (!username || !passwd) {
        return res.send({
            code: 400,
            message: "请求内容不完整",
        });
    }
    passwd = md5(passwd);

    const flag = registerWrite(username, passwd);

    if (!flag) {
        return res.status(400).send({
            code: '401',
            message: '账号重复'
        });
    }

    //注册成功， 生成token
    const token = generateToken(username);
    return res.send({
        code: '200',
        message: 'OK',
        token,
    });

}

export async function getTempToken(req: Reqs, res: Response) {
    if (!req.user || req.user.username == 'guest' || req.user.type == 'rat') {
        return res.send({ code: 401 });
    }

    let tempToken = generateTempToken(req.user.username);


    res.send({ code: 200, tempToken });
}


