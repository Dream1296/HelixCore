import express, { NextFunction, Request, Response } from 'express';
import { apps } from './httpToken';
import { apps1 } from './assetsLoa';
import { upDtList } from './upDtList';
const app = express();


//token验证中间件
app.use(apps);
app.use(apps1);
app.use(upDtList);




export default app;

