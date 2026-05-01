import express, { Request, Response, Router } from 'express';
const router = Router();


import  {login, getTempToken, register } from '../controllers/login';
//登录
router.post('/login',  login);

//注册
// router.post('/register',register);

//刷新token
router.get('/getTempToken',getTempToken);





export default router;


  