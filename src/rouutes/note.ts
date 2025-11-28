import express, { Request, Response, Router } from 'express';
const router = Router();


import { getNoteList } from '../controllers/note';


//获取笔记列表
router.get('/noteList',getNoteList);


import { audiso, auTime } from '../controllers/audio';
router.get('/xs',audiso);

router.get('/autime',auTime);






export default router;


  
