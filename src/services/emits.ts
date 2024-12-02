import { reDtListData } from "./dtList";
import { myEvent } from "./evenTs";


// 更新数据事件监测
myEvent.addListener('upDtList',(data:any)=>{
    reDtListData();
})

setTimeout(()=>{
    myEvent.emit('upDtList','start');
},100);


