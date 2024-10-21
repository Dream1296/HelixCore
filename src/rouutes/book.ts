import express, { Request, Response } from 'express';
const app = express();

import { bookData ,bookAU,booklists,bookCover ,bookJd, bookVData,bookRData} from '../controllers/book';

//获取图书内容
app.get('/bookdata', bookData);

//获取图书内容压缩的文件
app.get('/bookrdata', bookRData);

//图示视图内容
app.get('/bookvdata',bookVData);

//图书音频
app.get('/bookau',bookAU);

//图书列表
app.get('/booklist',booklists);

//图书封面
app.get('/bookcover',bookCover);

//图书阅读进度
app.get('/bookjd',bookJd);



export default app;


  