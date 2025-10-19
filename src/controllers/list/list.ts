import { getImgT, getList } from '@/models/list/list';
import express, { Request, Response } from 'express';
import { access, mkdir, constants } from 'fs/promises';


export async function getPathListR(req: Request, res: Response) {
    let pathStr = req.query.path as string;
    // let pathStr = '/havens/img/2023/2023.12'
    if (!pathStr) {
        return res.status(400).send({
            code: 400,
            data: []
        })
    }
    let data = await getList(pathStr);

    res.send({
        code: 200,
        data,
    });
}

export async function listImgT(req: Request, res: Response) {
    let dir = req.query.path;
    let hash = req.query.hash;
    if (!dir || !hash) {
        return res.status(400).send({ code: 400 })
    }
    let filePath = await getImgT(dir as string, hash as string);
    if (filePath != '-1') {
        return res.sendFile(filePath, {
            headers: {
                'Content-Type': 'image/png'
            }
        });
    }
    return res.status(400).send({ code: 500 })



}

export async function listImg(req: Request, res: Response) {
    let filePath = req.query.path;
    if (!filePath) {
        return res.status(400).send({ code: 400 });
    }
    try {
        await access(filePath as string);

        return res.sendFile(filePath as string, {
            headers: {
                'Content-Type': 'image/png'
            }
        });
    } catch (err) {
        return res.status(400).send({ code: 400 });
    }
}