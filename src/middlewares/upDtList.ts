import { myEvent } from "@/services/evenTs";
import { Reqs } from "@/type";
import { NextFunction, Request, Response }  from "express";
import { ServerResponse } from "http";
export function upDtList (req:Reqs, res:Response,next:NextFunction){
    const serverRes = res as unknown as ServerResponse; // 类型断言    
    let upArr = ['/api/postCom','/api/dtindex','/api/setBgStyle','/api/postdt','/api/delDt'];
    if(upArr.includes(req.path)){
        serverRes.on('finish',(e:any)=>{    
            myEvent.emit('upDtList');
        })
    }
    next();
}
