import { getPathListR, listImg, listImgT ,listVideo } from '@/controllers/list/list';
import { onlyUser } from '@/middlewares/onlyUser';
import express, { Request, Response, Router } from 'express';
const router = Router();


// router.use(onlyUser(['yw','234']));

router.get('/listPath',getPathListR);

router.get('/listImgT',listImgT);

router.get('/listImg',listImg);

router.get('/listVideo',listVideo);



export default router;