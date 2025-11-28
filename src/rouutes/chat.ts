import { getChatNode } from '@/controllers/chat';
import { onlyUser } from '@/middlewares/onlyUser';
import express, { Request, Response, Router } from 'express';
const router = Router();



// router.use(onlyUser(['yw','123']));

//获取动态数据
router.get('/getChatNode', getChatNode);



export default router;


