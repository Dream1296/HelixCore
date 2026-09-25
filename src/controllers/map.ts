import { dbSql } from '@/utils/dbSql';
import express, { Request, Response, Router } from 'express';


export async function getKeepMapGps(req: Request, res: Response){
    let keep_id = req.query.id;
    let sql = "SELECT time, E, N FROM `keep_gps` where keep_id = ?";
    let result = await dbSql<{time:number,E:number,N:number,}[]>(sql, [keep_id],false,'ai');
    let data = result.map(e => ({time: e.time, E: e.E, N: e.N}));
    res.json(data);
}