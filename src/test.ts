//读取环境变量
import { envStart } from '@/utils/env';

import { socketRequest } from "./tool/socketReq";
import { dtLists } from './models/dt/dt';


let a = dtLists('yw',1);
a.then(e =>{
    console.log(e);
    
})
    


// socketRequest('/')
//     .then(e=>{
//         console.log(e);
//     })