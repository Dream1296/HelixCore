import express, { Request, Response } from 'express';
import rouutes from './rouutes/index';
import {configs,sslConfig} from './config/config';
import mid from './middlewares/index';
import { webSocketInit } from './controllers/webSokcet';
import path from 'path';
const app = express();
import https from 'https';

const port = process.env.PORT || 3010;
//杂乱配置项
app.use(configs);

//中间件
app.use(mid);

//路由处理
app.use(rouutes);

//静态资源
app.use(express.static( path.join( __dirname ,   '../public')));

app.use('/book',express.static( path.join( __dirname ,   '../public')));
app.use('/dt',express.static( path.join( __dirname ,   '../public')));

//测试
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});





// 创建 HTTPS 服务器
const servers = https.createServer(sslConfig, app);
// const wss = new WebSocket.Server({ server });
// WebSocket(servers);
webSocketInit(servers);

servers.listen(3010, () => {
  console.log('HTTPS Server running on port 3010');
});

