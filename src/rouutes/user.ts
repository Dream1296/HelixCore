import express, { Request, Response, Router } from 'express';
const router = Router();


import {userClass , userIn,userImg,setMood} from '../controllers/user';

//用户类型
router.get('/userClass', userClass);

//用户信息
router.get('/userc',userIn);

//用户头像
router.get('/userImg',userImg);

// 心情提交
router.post('/setMood',setMood);





export default router;


  