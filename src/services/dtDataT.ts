import { socketRequest } from '@/tool/socketReq';


export async function getDtDataImg(title: string, data: string[]):Promise<Buffer> {
    let dataImg = await socketRequest<Buffer>('lib','/canvas/getDtDataImg', 'POST', { title, data },'buffer');
    return dataImg.data;
}
