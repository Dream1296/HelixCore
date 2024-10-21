import express, { Request, Response } from 'express';
const app = express();

import { getNoteList } from '../controllers/note';


//获取笔记列表
app.get('/noteList',getNoteList);


import { audiso, auTime } from '../controllers/audio';
app.get('/xs',audiso);

app.get('/autime',auTime);






export default app;


  
