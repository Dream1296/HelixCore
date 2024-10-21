import express, { Request, Response } from 'express';
const app = express();

import getTree from '../controllers/tree';

app.get('/gettree',getTree);
app.get('/gettreeid',getTree);



export default app;


  