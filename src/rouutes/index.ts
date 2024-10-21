import express, { Request, Response } from 'express';
const app = express();

//登录
import login from './login';
app.use('/api',login);

//用户信息
import user from './user';
app.use('/api',user);

//笔记
import note  from './note';
app.use('/api',note);

//动态功能
import dt from './dt';
app.use('/api',dt);

//天气
// import weather from './weather';
import weather from '@/rouutes/weather';
app.use('/api',weather);

//性能数据获取
import top from './top';
app.use('/api',top);

//树，
import tree from './tree';
app.use('/api',tree);

//视频
import vi from './web';
app.use('/api',vi);

//小说
import book from './book';
app.use('/api',book);

import { getHTML} from '../controllers/audio';
app.get('/lx',getHTML);



export default app