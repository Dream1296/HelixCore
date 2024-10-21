import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { getData ,getAu ,getBookList,bookCovers ,getBookJd,setBookJd,bookVDatas,bookRDatas } from '../models/book';
async function bookData(req:Request, res:Response){
    let bookId = req.query.id;
    if(!bookId){
        return res.send({code:404});
    }
    const data = await getData(bookId.toString());

    res.send({
        code:200,
        data
    });
}

async function bookRData(req:Request, res:Response){
    let bookId = req.query.bookid as string;
    if(!bookId){
        return res.send({code:404});
    }
    let filepath = await bookRDatas(bookId) as string;
    res.sendFile(filepath);
}

async function bookVData(req:Request, res:Response){
    let bookId = req.query.bookid as string;
    let start = req.query.start;
    let end = req.query.end;
    let num1 = req.query.num1;
    let num2 = req.query.num2;
    if(!bookId){
        return res.send({code:404});
    }
    if(!start || !end){
        start = '0';
        end = '200';
    }
    if(!num1 || !num2){
        num1 = '11';
        num2 = '13';
    }

    
    let vData = bookVDatas(bookId,Number(start),Number(end),Number(num1),Number(num2));
    
    return res.send(vData);


}

async function bookAU(req:Request, res:Response){
    const bookId = req.query.bookid;
    const id = req.query.id;
    if(!bookId || !id){
        return res.send({code:404});
    }
    let paths = await getAu(bookId.toString(),id.toString());    
    let datas = fs.readFileSync(paths).toString('base64');
    if(datas == ''){
        datas = fs.readFileSync(path.join(__dirname ,'../../public/bookData/audios/null.mp3')).toString('base64');
    }
    res.send({
        code:200,
        data:datas,
    }) 
    
}

async function booklists(req:Request, res:Response){
    let data = getBookList();
    res.send({
        code:200,
        data
    });
}

function bookCover(req:Request, res:Response){
    let bookid = req.query.bookid;
    if(!bookid){
        bookid = '';
    }

    let url = bookCovers(bookid.toString());
    res.sendFile(url);
}

async function bookJd(req:Request, res:Response){
    let bookid = req.query.bookid as string;
    let jd = req.query.jd as string;
    if(!bookid){
        return res.send({code:400});
    }
    if(!jd || jd == '-1'){
        let jds = await getBookJd(bookid);
        return res.send({code:200,data:{jd:jds}});
    }
    
    setBookJd(bookid,jd)
    .then(data =>{
        if(data == 'OK'){
            return res.send({code:200,data:{jd:jd}});
        }
    })

}




export {bookData,bookAU,booklists,bookCover,bookJd,bookVData,bookRData}