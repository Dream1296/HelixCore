import express, { Request, Response, Router } from 'express';
const router = Router();


import  { getKeepMapGps } from '../controllers/map';
//获取地图GPS
router.get('/getKeepMapGps',  getKeepMapGps);







export default router;
