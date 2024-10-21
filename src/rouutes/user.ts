import express, { Request, Response } from 'express';
const app = express();

import {userClass , userIn,userImg} from '../controllers/user';

//用户类型
app.get('/userClass', userClass);

//用户信息
app.get('/userc',userIn);

//用户头像
app.get('/userImg',userImg);



export default app;


  