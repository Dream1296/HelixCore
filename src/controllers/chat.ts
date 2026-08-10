import { Reqs } from "@/type";
import { dbSql } from "@/utils/dbSql";
import express, { Request, Response } from 'express';
import { prisma } from '@/config/prisma'

type nodeT = {
    id: string,
    parent_id: string,
    author: string,
    content: string,
    date: string,
    model_slug: string,
    conversation_json: string,
}

type nodeCom = {
    id: string,
    nodeId: string,
    con: string,
    date: string,
}
async function getFuNode(id: string) {
    let list = await dbSql<nodeT[]>('SELECT * FROM node where parent_id = ? ORDER BY id ASC;', [id], undefined, 'chat');
    return list
}

async function getNode(id: string) {
    let list = await dbSql<nodeT[]>('SELECT * FROM node where id = ? ORDER BY id ASC;', [id], undefined, 'chat');
    return list[0]
}

let nodeList: nodeT[] = [];


async function getNodeList(id: string) {
    let a = await getFuNode(id);
    if (a && a.length > 0) {
        for (let b of a) {
            b.conversation_json = '';
            nodeList.push(b);
            await getNodeList(b.id);
        }
    }
};

async function getXinxi(id: string) {
    let sql = `SELECT * FROM list where root_node = ? OR id = ? ORDER BY id ASC;`;
    type T = {
        title: string;
        create_time: string;
        update_time: string;
        account: string;
        tag: string;
        root_node:string
    }
    let data = await dbSql<T[]>(sql, [id, id], undefined, 'chat');
    if (data.length > 0) {
        return data[0];
    } else {
        return {
            title: '选段',
            create_time: '2024-08-13 21:52:05',
            update_time: '2024-08-13 21:52:05',
            account: 'null',
            tag: 'null',
            root_node: 'null',
        }
    }
};



export async function getChatNode(req: Reqs, res: Response) {
    let id = req.query.id as string;
    
    
    if (!id) {
        res.status(404).send({
            code: 404
        })
    }
    
    if(!req.user || req.user.username != 'dlhe' && req.user.username != 'yw' ){
        return res.status(400).send({
            code: 400
        })
    }

    let xinxi = await getXinxi(id);
    id = xinxi.root_node;

    nodeList.length = 0;

    if(!await getNode(id)){
        console.log(id);
    }

    nodeList.push(await getNode(id));


    await getNodeList(id);

    let nodeIdList = new Set<string>();
    for (let a of nodeList) {
        nodeIdList.add(a?.id);
    }
    // let comList = await getCom(nodeIdList);



    res.send({
        code: 200,
        data: {
            ...xinxi,
            rootId: id,
            nodeList: nodeList,
            // comList: comList
        }
    })


}