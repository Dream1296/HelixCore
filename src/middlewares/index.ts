import express, { NextFunction, Request, Response } from 'express';
import { apps } from './httpToken';
import { apps1 } from './assetsLoa';
import { upDtList } from './upDtList';
import { setLog } from './log';
const app = express();


//token验证中间件
app.use(apps);
//鉴权
app.use(apps1);
// 判断是否刷新redis
app.use(upDtList);

//日志记录
app.use(setLog);




export default app;

