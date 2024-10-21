import express, { Request, Response } from 'express';

import { getTreeNode } from '../models/tree';


async function getTree(req:Request, res:Response){
    let id = req.query.id || 1;
    let data = await getTreeNode(id as number);

    res.send(data);
}

export default getTree