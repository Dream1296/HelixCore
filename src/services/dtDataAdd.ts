import { dataImg, Lists, Listsc, Mood, Top } from "@/type";

import { dbSql } from "@/utils/dbSql";

let comArr:(dataImg|Mood|Top)[] = [];

async function getCom(type:'dataImg' | 'mood' | 'top'){
    if(!comArr.length){
        let a = await dbSql<{type: 'dataImg' | 'mood' | 'top',id:string,touxian:string,name:string,show_index:number}[]>('SELECT * FROM dt_com');        
        for(let data of a){
            comArr.push({
                ...data
            })
        }
        return comArr.find(obj => obj.type == type);
    }

    return comArr.find(obj => obj.type == type);
    
}

//想动态数据中添加数据
export async function dtDataAdd(datas:Lists[]){
    let data:(Listsc | dataImg | Top | Mood)[] = [];

    for(let e of datas){
        data.push({
            type:'A',
            ...e
        })
    }


    let dataImg = await getCom('dataImg');
    // data.unshift(dataImg!);
    data.splice(0,0,dataImg!);

    // let moodFrome = await getCom('mood');
    // data.splice(1,0,moodFrome!);

    let top = await getCom('top');
    data.splice(2,0,top!);
    
    return data;
}