import net from 'net';
import { handleTcpData, MsgData, packMessage, ParsedMessage } from './tool';
import axios from 'axios';
import { generateToken } from '../token';
import { getVideoSrc } from '@/models/dt/dt';
import { getUrl } from '@/pathUtils';
import fs from 'fs';
import { ensureVideoIsMP4 } from '@/controllers/dt';
import path from 'path';
const PORT = 5000;

const socketInfo = new Map<net.Socket, { token: string }>();

type ReqData = {
    url: string,
    method: 'GET' | 'POST',
    headers: any;
    contentType: 'json' | 'buffer' | 'video'
}


function setToken(msg: ParsedMessage, socket: net.Socket) {
    let token = JSON.parse(msg.body.toString()) as { token: string };
    if (token.token == 'eyJ1c2VyX2lkIjoieXciLCJkdGlkIjoiLTEiLCJkYXRlIjoxNzU0MjE2MzM5MzAxLCJ0eXBlIjoibHRrIn0') {
        let userToken = generateToken('yw');
        socketInfo.set(socket, { token: userToken });
        socket.write(packMessage(JSON.stringify({ tf: 1 }), msg.id, 0));
        // console.log('鉴权成功');
    }
}

async function setVideo(msg: ParsedMessage, socket: net.Socket) {
    type reqVideoData = {
        dtid: number,
        index: number,
        range: number,
    }

    type resVideoData = {
        start: number,
        end: number,
        size: number,
    }

    let body = JSON.parse(msg.body.toString()) as reqVideoData;

    let file = await getVideoSrc(body.dtid, body.index);
    if (!file) {
        return
    }
    let videoUrl = path.join(getUrl('assets'), 'a', file.video_src, 'video/');

    let fileSrc = path.join(videoUrl, 'original', file.video_name);
    fileSrc = ensureVideoIsMP4(fileSrc);

    const stat = fs.statSync(fileSrc);


    const fileSize = stat.size;
    const maxChunkSize = 1024 * 512;
    const start = body.range;
    const end = Math.min(start + maxChunkSize, fileSize) - 1;
    const chunksize = (end - start) + 1;
    // 一次性读到内存
    const videoBuffer = Buffer.alloc(chunksize);
    const fd = fs.openSync(fileSrc, 'r');
    fs.readSync(fd, videoBuffer, 0, chunksize, start);
    fs.closeSync(fd);

    let videoObj: resVideoData = {
        start: start,
        end: end,
        size: fileSize
    }

    let videoStr = JSON.stringify(videoObj);

    let bufferYuna = Buffer.alloc(100, ' ');
    bufferYuna.write(videoStr, 0);
    let data = Buffer.concat([bufferYuna, videoBuffer]);

    socket.write(packMessage(data, msg.id, 1));

}


const server = net.createServer((socket) => {
    console.log('新客户端连接:', socket.remoteAddress, socket.remotePort);

    // 每个连接有自己独立的 msgData
    let msgData: MsgData = { len: 0, data: Buffer.alloc(0) };

    socketInfo.set(socket, { token: 'null' });
    socket.on('data', (chunk) => {
        // if (chunk.toString() == 'ping') 
        //     return socket.write('ping');
        // }



        let msgArr: ParsedMessage[] = [];

        try {
            msgArr = handleTcpData(chunk, msgData);
        } catch (error: any) {
            console.log('解密错误连接将主动断开');
            socket.end();
        }


        for (let msg of msgArr) {


            let id = msg.id;

            //type为鉴权
            if (msg.type === 2) {
                setToken(msg, socket);
                console.log('鉴权成功');

                return;
            }

            if (!socketInfo.has(socket)) {
                console.log('权限错误');

                socket.end();
            }



            if (msg.type == 3) {
                setVideo(msg, socket);
                return
            }






            let url = JSON.parse(msg.body.toString()) as ReqData;

            url.url = 'http://127.0.0.1:3010' + url.url;

            let responseType: 'json' | 'arraybuffer' = url.contentType == 'json' ? 'json' : 'arraybuffer';



            axios({
                url: url.url,
                method: url.method,
                headers: {
                    ...url.headers,
                    authorization: `Bearer ${socketInfo.get(socket)?.token}`,
                    'if-none-match': undefined,
                    'if-modified-since': undefined
                },
                responseType,
            })
                .then((res: { data: any; }) => {
                    if (responseType == 'json') {
                        socket.write(packMessage(JSON.stringify(res.data), id, 0));
                    }

                    if (responseType == 'arraybuffer') {
                        socket.write(packMessage(res.data, id, 1));
                    }

                })
        }




    });














    socket.on('end', () => {
        console.log('未知错误,断开连接');
        socketInfo.delete(socket)
    });

    socket.on('error', (err) => {
        console.log('未知错误,断开连接');
        socketInfo.delete(socket)
    });
});

server.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
});




