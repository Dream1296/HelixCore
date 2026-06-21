import { getVideoAu, getVideoAuFile, upVideoText } from '@/controllers/video_au';
import express, { Request, Response, Router } from 'express';
const router = Router();




router.get('/getVideoAu',getVideoAu);

router.get('/getVideoAuFile',getVideoAuFile);

router.post('/upVideoText',upVideoText);


export default router;







