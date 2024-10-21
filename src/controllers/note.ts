import {getNoteLists  } from '../models/note';
import express, { Request, Response } from 'express';
import { Reqs } from '../type';



//按顺序获取所以笔记
async function getNoteList(req:Reqs,res:Response){
    
    let listNum = req.query?.listmax || 100;
    listNum = Number(listNum);
    const user = req.user?.username as string;

    let couts = Number(req.query?.cout  || 0 );

    //列表数据
    let data = await getNoteLists();
    
    //页数
    let cout = couts  || 0;
    cout++;
    //列表长度
    const dataLen = data.length;

    //最大页数
    let coutMax = Math.floor( dataLen / listNum);
    coutMax = coutMax * listNum < dataLen ? coutMax + 1: coutMax;


    cout = cout >= coutMax ? coutMax - 1 : cout;



    
    if( coutMax > 1 ){
        if( cout == coutMax ){
            data = data.slice( (cout - 1) * listNum  , dataLen);
        }
        if(cout != coutMax ){
            data = data.slice( (cout - 1) * listNum ,cout * listNum);
        }
    }

    const resc = {
        code:200,
        cout:couts  || 0,
        coutLen:coutMax,
        data
    }



    
    if(user == 'yw'){
        return res.send(resc)
    }else{
        return res.send({});
    }
}

function getNoteLog(){

}

function getNoteContent(){

}


export {getNoteList}