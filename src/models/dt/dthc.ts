import { Reqs } from "@/type";
import {Response} from 'express'


export async function getImgDB(req: Reqs, res: Response){
    if(!req.user || req.user.username != 'yw'){
        res.status(400).send({
            code:400
        })
        return
    }
    let DtList = await prisma?.dt.findMany({
        where:{
            shows:true,
            save:true
        }
    });
    if(!DtList){
        res.status(500).send({
            code:500,
        })
        return 
    }
    
    let resData = [];
    for(let a of DtList){
        resData.push({
            id:a.id,
            user:a.user,
            imgShowNum:a.img_show_num,
            imgAllNum:a.img_all_num,
            videoNum:a.video_num,
            save:a.save,
        })
    }
    res.send({
        code:200,
        data:resData
    })

}
