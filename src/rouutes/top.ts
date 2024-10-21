import express, { Request, Response } from 'express';
const app = express();

import {xnlist , getIpv6} from '../controllers/top';


//获取性能数据
app.get('/xnlist',xnlist);

//获取ipv6地址
app.get('/ipv6',getIpv6);


export default app;


  
