import express, { NextFunction, Request, Response } from 'express';
import { apps } from './httpToken';
const app = express();


//token验证中间件
app.use(apps);




export default app;

