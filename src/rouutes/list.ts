import { getPathListR } from '@/controllers/list/list';
import express, { Request, Response } from 'express';
const app = express();

app.get('/listPath',getPathListR);

export default app;