import express, { Request, Response } from 'express';
const app = express();

import login from '../controllers/login';

//登录
app.post('/login',  login);


export default app;


  