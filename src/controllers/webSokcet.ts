const webSocket = require('ws');
import { getNoteLog,setNoteLog } from "../models/note";

function webSocketInit(server:any){
    const wss = new webSocket.Server({ server });
    wss.on('connection',(ws:WebSocket,req: { socket: { remoteAddress: any; }; })=>{
        getNoteLog()
        .then(data=>{
            ws.send(JSON.stringify({
                type:'gettext',
                ...data
            }));
        })

        ws.addEventListener('message',(data)=>{
            const req = JSON.parse(data.data);
            console.log(req);
            
            if(req.type == 'settext'){
                setNoteLog(req.content)
                    .then((data)=>{
                        if(data == req.content){
                            ws.send(JSON.stringify({
                                type:'settext',
                                contentNum:req.content.length,
                            }))
                        }
                    })
            }
            if(req.type == 'gettext'){
                getNoteLog()
                .then(data=>{
                    ws.send(JSON.stringify({
                        type:'gettext',
                        ...data
                    }));
                })
            }
            
        })
    })
    
    return wss;
}


export {webSocketInit}