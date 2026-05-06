//                            _ooOoo_  
//                           o8888888o  
//                           88" . "88  
//                           (| -_- |)  
//                            O\ = /O  
//                        ____/`---'\____  
//                      .   ' \\| |// `.  
//                       / \\||| : |||// \  
//                     / _||||| -:- |||||- \  
//                       | | \\\ - /// | |  
//                     | \_| ''\---/'' | |  
//                      \ .-\__ `-` ___/-. /  
//                   ___`. .' /--.--\ `. . __  
//                ."" '< `.___\_<|>_/___.' >'"".  
//               | | : `- \`.;`\ _ /`;.`/ - ` : | |  
//                 \ \ `-. \_ __\ /__ _/ .-` / /  
//         ======`-.____`-.___\_____/___.-`____.-'======  
//                            `=---='  
//  
//         .............................................  
//                  佛祖保佑             永无BUG 
import express, { Application, Request, Response } from 'express';
import fs from 'fs';
//读取环境变量
import { envStart } from './utils/env';
envStart;

const app = express();

//杂乱配置项
import { configs, sslConfig } from './config/config';
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
// import { getMqttDate } from './services/Aether';
// import { readAHT10Data } from './services/sensor';









//主接口
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});



// getMqttDate();



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
