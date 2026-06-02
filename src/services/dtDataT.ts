import { socketRequest } from '@/tool/socketReq';


export async function getDtDataImg(title: string, data: string[]):Promise<Buffer> {
    let dataImg = await socketRequest<Buffer>('/canvas/getDtDataImg', 'POST', { title, data },'buffer');
    return dataImg;
}
