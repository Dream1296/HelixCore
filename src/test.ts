//读取环境变量
import { envStart } from '@/utils/env';
envStart;

import { socketRequest } from "./tool/socketReq";



socketRequest('/')
    .then(e=>{
        console.log(e);
    })