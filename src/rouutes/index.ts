import express, { Request, Response, Router } from 'express';
const app = Router();


//登录
import login from './login';
app.use(login);

//会话
import Chat from './chat';
app.use(Chat);

// import { getHTML} from '../controllers/audio';
// app.get('/lx',getHTML);

import list from './list'
app.use(list);


//用户信息
import user from './user';
app.use(user);

//笔记
import note from './note';
app.use(note);

//动态功能
import dt from './dt';
app.use(dt);

//天气
// import weather from './weather';
import weather from '@/rouutes/weather';
app.use(weather);

//性能数据获取
import top from './top';
app.use(top);

//树，
import tree from './tree';
app.use(tree);

//视频使
import vi from './web';
app.use(vi);

//小说
import book from './book';
app.use(book);








export default app