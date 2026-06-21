// 实现fs文件系统调用

import { getDtImgFsService } from "./fsService";

//图片获取
export async function getDtImgFs(dtid:number,index:number,size:number,type:'buffer'){
    return await getDtImgFsService(dtid,index,size,type);
}