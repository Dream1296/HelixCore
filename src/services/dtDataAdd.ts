import { dataImg, Lists, Listsc } from "@/type";


//想动态数据中添加数据
export function dtDataAdd(datas:Lists[]){
    let data:(Listsc | dataImg)[] = [];

    for(let e of datas){
        data.push({
            type:'A',
            ...e
        })
    }

    let test:dataImg = {
        type:'dataImg',
        date:'2024-01-21 12:12',
        id:999,
        name:'服务器',
        touxian:'xt',
        user:'xt',
    }

    data.unshift(test);
    
    return data;
}