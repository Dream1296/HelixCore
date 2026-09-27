import { getPathListR, listImg, listImgT ,listVideo , listFile} from '@/controllers/list/list';
import express, { Request, Response, Router } from 'express';
import { allowUsers } from '@/middlewares/allowUsers';
const router = Router();


// router.use(onlyUser(['yw','234']));
let allowUserArr = ['yw','dlhe'];

// 获取目录文件列表
router.get('/listPath',allowUsers(...allowUserArr),getPathListR);

// 获取缩略图
router.get('/listImgT',allowUsers(...allowUserArr),listImgT);

router.get('/listImg',allowUsers(...allowUserArr),listImg);

router.get('/listVideo',allowUsers(...allowUserArr),listVideo);

router.get('/listFile',allowUsers(...allowUserArr),listFile);



export default router;