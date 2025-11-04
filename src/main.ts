import express, { Application, Request, Response } from 'express';

//读取环境变量
import { envStart } from './utils/env';
import rouutes from './rouutes/index';
import { configs, sslConfig } from './config/config';

import mid from './middlewares/index';
import { webSocketInit } from './controllers/webSokcet';

import fs from 'fs';

import path from 'path';
envStart;

const app = express();
import https from 'https';

let figlet = require("figlet");
//杂乱配置项
app.use(configs);


import '@/services/socket/socket';
import { systemInit } from './init';


systemInit();

//事件监听
import "@/services/emits";
import { getUrl } from './pathUtils';
import { getMqttDate } from './services/Aether';
import { readAHT10Data } from './services/sensor';


//中间件
app.use(mid);

//路由处理
app.use(rouutes);

//静态资源
// app.use(express.static(path.join(__dirname, '../public/web')));

// 静态资源托管目录
const staticPath = path.join(__dirname, '../public/web');

// 配置静态资源响应头
app.use(
    express.static(staticPath, {
        setHeaders: (res, filePath) => {
            // 根据文件类型添加不同的缓存策略
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache'); // HTML 通常不缓存
            } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存一年
            } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.svg')) {
                res.setHeader('Cache-Control', 'public, max-age=604800'); // 缓存一周
            }

            // 设置强制缓存的 ETag（根据文件内容生成标识）
            res.setHeader('ETag', 'W/"' + Date.now() + '"'); // 简单示例，实际场景中应使用文件哈希
        },
    })
);


//测试
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});



getMqttDate();

readAHT10Data();




// 创建 HTTP/2 服务器
// const server = expressHttp2.createServer(sslConfig, app);



// 创建 HTTPS 服务器
// const servers = https.createServer(sslConfig, app);

// const wss = new WebSocket.Server({ server });
// WebSocket(servers);

//已 TODO:暂时不用websocket
// webSocketInit(servers);
app.listen(process.env.PORT, () => {
    // console.log('启动成功，端口3010');
    let fontSrc = getUrl('assets', 'system/font/standard.flf');
    let fontData = fs.readFileSync(fontSrc, "utf8");
    // 注册字体到 figlet
    figlet.parseFont('standard', fontData);

    figlet.text(
        "Dream1296", {
        font: "standard"
    },
        function (err: any, data: any) {
            if (err) {
                console.log(`启动成功,端口${process.env.PORT}`);
                return;
            }
            console.log(data);
        }
    );
    console.log(`启动成功,端口${process.env.PORT}`);
});
