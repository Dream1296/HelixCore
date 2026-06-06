import { getVideoAu, getVideoAuFile } from '@/controllers/video_au';
import express, { Request, Response, Router } from 'express';
const router = Router();




router.get('/getVideoAu',getVideoAu);

router.get('/getVideoAuFile',getVideoAuFile);



export default router;







