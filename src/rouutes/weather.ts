import express, { Request, Response } from 'express';
const app = express();


import {weatherData} from '../controllers/weather';

app.get('/weather',weatherData)




export default app;