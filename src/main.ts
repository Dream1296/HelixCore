import express, { Request, Response } from 'express';
import rouutes from './rouutes/index';
import { configs, sslConfig } from './config/config';
import mid from './middlewares/index';
import { webSocketInit } from './controllers/webSokcet';
import path from 'path';
const app = express();
import https from 'https';
let figlet = require("figlet");

const port = process.env.PORT || 3010;
//杂乱配置项
app.use(configs);

//中间件
app.use(mid);

//路由处理
app.use(rouutes);

//静态资源
app.use(express.static(path.join(__dirname, '../public/web')));

//测试
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});






// 创建 HTTPS 服务器
const servers = https.createServer(sslConfig, app);
// const wss = new WebSocket.Server({ server });
// WebSocket(servers);

//已 TODO:暂时不用websocket
// webSocketInit(servers);
servers.listen(3010, () => {
    // console.log('启动成功，端口3010');
    figlet.text(
        "Dream1296",
        function (err: any, data: any) {
            if (err) {
                console.log("启动成功,端口3010");
                return;
            }
            console.log(data);
        }
    );
});

