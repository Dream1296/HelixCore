import { myEvent } from "./services/evenTs";
import { ThumbnailInit } from "./services/MyLRU";
import { solarEnergyData } from "./services/solarEnergy";

export function systemInit() {

    //监听mqtt中数据
    // setTimeout(() => {
    //     solarEnergyData();
    // }, 3000);



    // 建立图片和视频封面缓存
    setTimeout(() => {
        // 缓存普通类似和特殊类似图片封面数量
        ThumbnailInit(500, 500);
    }, 1800 * 1000);

    //触发动态缓存更新
    setTimeout(() => {
        // 监听更新在services/emits.ts函数中
        myEvent.emit('upDtList', 'start');
    }, 2000);

    if (!process.env.aNew) {

        return new Error('环境变量aNuw错误');
        process.exit(-1);
    }




}