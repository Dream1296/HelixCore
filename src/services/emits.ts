import { reDtListData } from "./dtList";
import { myEvent } from "./evenTs";
import { pollingKeepBadminton, pollingKeepRun } from "./keep";


// 更新数据事件监测
myEvent.addListener('upDtList', (data: any) => {
    //更新redis缓存
    reDtListData();

    // pollingKeepRun();
    // pollingKeepBadminton();
});



