import { getPathListR, listImg, listImgT } from '@/controllers/list/list';
import express, { Request, Response } from 'express';
const app = express();

app.get('/listPath',getPathListR);

app.get('/listImgT',listImgT);

app.get('/listImg',listImg);



export default app;