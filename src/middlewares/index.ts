import express, { NextFunction, Request, Response, Router } from 'express';
import { setToken } from './httpToken';
import { loas } from './assetsLoa';
import { upDtList } from './upDtList';
import { setLog } from './log';
const router = Router();


//token验证中间件
router.use(setToken);
//鉴权
router.use(loas);

// 判断是否刷新redis
router.use(upDtList);

//日志记录
router.use(setLog);




export default router;

