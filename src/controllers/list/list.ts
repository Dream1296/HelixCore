import { getImgT, getList } from '@/models/list/list';
import express, { Request, Response } from 'express';
import { access, mkdir, constants } from 'fs/promises';
import fs from 'fs';
import { Reqs } from '@/type';
import { getFileFsStream } from '@/services/fs';
import { getFileFsStreamList, getVideoFsStream } from '@/models/list/fsList';

export async function getPathListR(req: Reqs, res: Response) {
    let pathStr = req.query.path as string;
    throw new Error('全局error测试');
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

export async function listImgT(req: Reqs, res: Response) {
    let hash = req.query.hash;
    if (!hash) {
        return res.status(400).send({ code: 400 })
    }
    let buffer = await getImgT(hash as string);

    if (buffer.length != 0) {
        res.setHeader('Content-Type', 'image/png');
        return res.send(buffer);
    }
    return res.status(404).send({ code: 404 })
}

export async function listImg(req: Reqs, res: Response) {
    let filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).send({ code: 400 });
    }
    console.log(filePath);

    res.setHeader('Content-Type', 'image/png');
    getFileFsStreamList(filePath, res);
}

export async function listVideo(req: Reqs, res: Response) {
    
    let filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).send({ code: 400 });
    }
    getVideoFsStream(req, res, filePath);
}

export async function listFile(req: Reqs, res: Response) {
    let filePath = req.query.path as string;
    getFileFsStreamList(filePath, res);
}

