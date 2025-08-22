import { getChatNode } from '@/controllers/chat';
import express, { Request, Response } from 'express';
const app = express();



//获取动态数据
app.get('/getChatNode',getChatNode);



export default app;


