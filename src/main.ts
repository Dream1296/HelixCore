import express, { Application, Request, Response } from 'express';
//读取环境变量
import { envInit } from '@/utils/env';
envInit();

const app = express();

//杂乱配置项
import { configs } from './config/config';
app.use(configs);

//中间件
import mid from './middlewares/index';
app.use(mid);

// 路由
import rouutes from './rouutes/index';
app.use('/api',rouutes);


let figlet = require("figlet");





import '@/services/socket/socket';
import { systemInit } from './init';


systemInit();

//事件监听
import "@/services/emits";
import { getUrl } from './pathUtils';
import { errorHandler } from './middlewares/errorHandler';
// import { getMqttDate } from './services/Aether';
// import { readAHT10Data } from './services/sensor';


// 全局错误处理
app.use(errorHandler);


    



//主接口
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});



// getMqttDate();

import standard from '@/assets/standard.md';

app.listen(process.env.PORT, () => {
    // console.log('启动成功，端口3010');
    // 注册字体到 figlet
    figlet.parseFont('standard', standard);

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
