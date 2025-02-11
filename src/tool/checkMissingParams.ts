import { Request, Response } from 'express';

type ParamConfig = {
    key : string,
    type : 'string' | 'number' | 'boolean' | 'object' | 'array',
    required?: boolean,
    source?: 'param' | 'body' | undefined,
    default? : any,
}

export function validateParams(req: Request, res: Response, source: 'param' | 'body', keyArr: ParamConfig[]) {
    //处理source
    if( source == 'param'){
        for(let key of keyArr){
            if(!key.source){
                key.source = 'param';
            }
        }
    }
    //处理required
    for(let key of keyArr){
        if(key.required == undefined){
            key.required = true;
        }
    }

    //提供keyArr的中key和type的值，构建处data的类型
    // type Data = {

    // };
    // for(let key of keyArr){
    //     Data[key.key] = key.type;
    // }



    
 
    // 获取源数据，根据 source 判断是从 params 还是 body 中取
//   const data = source === 'param' ? req.params : req.body;




//   // 遍历 keyArr 数组，检查每个必需的参数
//   for (const key of keyArr) {
//     if (!data[key]) {
//       // 如果找不到参数，返回 400 错误
//       res.status(400).json({
//         code: 400,
//         msg: `缺少必需的参数: ${key}`,
//       });
//       return false;  // 终止后续的处理
//     }
//   }

//   return data;  // 如果所有参数都存在，返回 true
}
