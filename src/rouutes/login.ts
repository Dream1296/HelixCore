import express, { Request, Response, Router } from 'express';
const router = Router();


import  {login, getTempToken } from '../controllers/login';

//登录
router.post('/login',  login);

//刷新token
router.get('/getTempToken',getTempToken);





export default router;


  