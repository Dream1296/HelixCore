import { getList } from '@/models/list/list';
import express, { Request, Response } from 'express';



export async function getPathListR(req: Request, res: Response) {
    let pathStr = req.query.path as string;
    // let pathStr = '/havens/img/2023/2023.12'
    if (!pathStr) {
        return res.status(400).send({
            code: 400,
            data:[]
        })
    }
    let data = await getList(pathStr);

    res.send({
        code: 200,
        data,
    });
}
