import express, { Request, Response } from 'express';
const app = express();

import {xnlist , getIpv6,setFanL} from '../controllers/top';


//获取性能数据
app.get('/xnlist',xnlist);

//获取ipv6地址
app.get('/ipv6',getIpv6);

// 开关风扇
app.get('/setFan',setFanL);


export default app;


  
