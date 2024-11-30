import express, { Request, Response } from 'express';
const app = express();

import  {login, getTempToken } from '../controllers/login';

//登录
app.post('/login',  login);

//刷新token
app.get('/getTempToken',getTempToken);





export default app;


  