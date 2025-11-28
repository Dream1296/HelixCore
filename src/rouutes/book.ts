import express, { Request, Response, Router } from 'express';
const router = Router();

import { bookData ,bookAU,booklists,bookCover ,bookJd, bookVData,bookRData} from '../controllers/book';

//获取图书内容
router.get('/bookdata', bookData);

//获取图书内容压缩的文件
router.get('/bookrdata', bookRData);

//图示视图内容
router.get('/bookvdata',bookVData);

//图书音频
router.get('/bookau',bookAU);

//图书列表
router.get('/booklist',booklists);

//图书封面
router.get('/bookcover',bookCover);

//图书阅读进度
router.get('/bookjd',bookJd);



export default router;


  