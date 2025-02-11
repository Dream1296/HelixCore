import * as t from 'io-ts';
import { Request,Response,NextFunction } from "express";

function isType<T>(value: any, type: t.Type<T>): value is T {
    const result = type.decode(value);
    return result._tag === 'Right'; // 'Right' 表示验证通过
}

export function isRequest(type:t.Type<any>){
    return (req:Request,res:Response,next:NextFunction)=>{
        if(isType(req.query,type)){
            const query = req.query as t.TypeOf<typeof type>;
            // 将新的 query 赋值回 req.query（或者传递到其他地方）
            req.query = query;
            next();
        }else{
            res.status(400).send({
                code:400,
                data:req.query
            });
        }
    }
}
