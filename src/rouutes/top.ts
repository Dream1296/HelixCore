import express, { Request, Response, Router } from 'express';
const router = Router();


import {xnlist , getIpv6,setFanL,getIp} from '../controllers/top';


//获取性能数据
router.get('/xnlist',xnlist);

//获取ipv6地址
router.get('/ipv6',getIpv6);

//获取当前请求的ip
router.get('/getip',getIp);

// 开关风扇
router.get('/setFan',setFanL);


export default router;


  
