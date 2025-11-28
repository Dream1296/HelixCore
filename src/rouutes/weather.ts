import express, { Request, Response, Router } from 'express';
const router = Router();



import {weatherData} from '../controllers/weather';

router.get('/weather',weatherData)




export default router;