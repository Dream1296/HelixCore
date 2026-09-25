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

// 获取父节点
async function getFuNode(id: string) {
    let list = await dbSql<nodeT[]>('SELECT * FROM node where parent_id = ? ORDER BY id ASC;', [id], undefined, 'chat');
    return list
}

// 获取节点
async function getNode(id: string) {
    let list = await dbSql<nodeT[]>('SELECT * FROM node where id = ? ORDER BY id ASC;', [id], undefined, 'chat');
    return list[0]
}

let nodeList: nodeT[] = [];

// 传入一个子节点，之后的所有节点
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

// 获取会话信息
async function getXinxi(id: string) {
    let sql = `SELECT * FROM list where root_node = ? OR id = ? ORDER BY id ASC;`;
    type T = {
        id: string;
        title: string;
        create_time: string;
        update_time: string;
        account: string;
        tag: string;
        root_node: string
    }
    let data = await dbSql<T[]>(sql, [id, id], undefined, 'chat');
    if (data.length > 0) {
        return data[0];
    } else {
        return {
            id: '-1',
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

    // 前端传来的id，可能是根节点id，也可能是会话id
    let idReq = req.query.id as string;


    if (!idReq) {
        res.status(404).send({
            code: 404
        })
    }

    if (!req.user || req.user.username != 'dlhe' && req.user.username != 'yw') {
        return res.status(400).send({
            code: 400
        })
    }

    // 自定义根节点，
    let rootUserNode: nodeT = {
        id: idReq,
        parent_id: 'root',
        author: 'user',
        content: '这是一个根节点',
        date: '2004-02-17T09:42:56.000Z',
        model_slug: 'null',
        conversation_json: '',
    }

    // 会话信息
    let listInf = await getXinxi(idReq);
    // 根节点id
    let rootNodeId = listInf.root_node;

    // listInf.root_node = idReq;

    nodeList.length = 0;
    // 如果前端传入的是根节点
    if (rootNodeId == idReq) {
        // 我们的自定义节点
        rootUserNode
        // 通过根节点id拿到根节点
        let rootNode = await getNode(rootNodeId);
        // 通过根节点id拿到根节点的子节点
        let childNodeList = await getFuNode(rootNodeId);
        let newRootNodeId = rootNodeId + '_new';
        
        rootNode.parent_id = rootUserNode.id;
        rootNode.id = newRootNodeId;
        childNodeList.forEach((node) => {
            node.parent_id = newRootNodeId;
        })
        
        nodeList.push(rootUserNode);
        nodeList.push(rootNode);
        nodeList.push(...childNodeList);

        
        await getNodeList(rootNodeId);

        let nodeIdList = new Set<string>();
        for (let a of nodeList) {
            nodeIdList.add(a?.id);
        }



    }

    // 如果前端传入的是会话id
    if (listInf.id == idReq) {
        // 通过根节点id拿到根节点
        let rootNode = await getNode(rootNodeId);

        // 根节点的父节点指向我们构建的根节点
        rootNode.parent_id = idReq;

        nodeList.push(rootUserNode);
        nodeList.push(rootNode);


        await getNodeList(rootNodeId);

        let nodeIdList = new Set<string>();
        for (let a of nodeList) {
            nodeIdList.add(a?.id);
        }
    }





    res.send({
        code: 200,
        data: {
            ...listInf,
            rootId: idReq,
            nodeList: nodeList,
            // comList: comList
        }
    })


}