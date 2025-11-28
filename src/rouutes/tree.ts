import express, { Request, Response, Router } from 'express';
const router = Router();


import getTree from '../controllers/tree';

router.get('/gettree',getTree);
router.get('/gettreeid',getTree);



export default router;


  