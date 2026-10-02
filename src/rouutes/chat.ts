import { getChatNode } from '@/controllers/chat';
import express, { Request, Response, Router } from 'express';
import { allowUsers } from '@/middlewares/allowUsers';
const router = Router();
let allowUserArr = ['yw','dlhe'];



//获取会话数据
router.get('/getChatNode',allowUsers(...allowUserArr), getChatNode);



export default router;


