import { dataImg, Lists, Listsc, Mood, Top, Year } from "@/type";

import { dbSql } from "@/utils/dbSql";

let comArr: (dataImg | Mood | Top)[] = [];

async function getCom(type: 'dataImg' | 'mood' | 'top') {
    if (!comArr.length) {
        let a = await dbSql<{ type: 'dataImg' | 'mood' | 'top', id: string, touxian: string, name: string, show_index: number }[]>('SELECT * FROM dt_com');
        for (let data of a) {
            comArr.push({
                ...data
            })
        }
        return comArr.find(obj => obj.type == type);
    }

    return comArr.find(obj => obj.type == type);

}

//向动态数据中添加组件数据
export async function dtDataAdd(datas: Lists[], loa?: number) {
    let data: (Listsc | dataImg | Top | Mood | Year)[] = [];

    for (let e of datas) {
        data.push({
            type: 'A',
            ...e
        })
    }


    if (loa == 0 || loa == 1) {
        let dataImg = await getCom('dataImg');
        // data.unshift(dataImg!);
        dataImg!.id = '2000';
        data.splice(0, 0, dataImg!);
        let top = await getCom('top');
        data.splice(2, 0, top!);
    }

    if (loa == 13) {
        let dataImg = await getCom('dataImg');
        dataImg!.id = '2013';
        data.splice(1, 0, dataImg!);
    }


    //向数组适当位置添加年份信息
    setYear(data);



    return data;
}


export function setYear(data: (Listsc | dataImg | Top | Mood | Year)[]) {
    let year = -1;
    let id = 6100;
    for (let a of data) {
        if (a.type != 'A') {
            continue;
        }
        let date = new Date(a.date).getFullYear();
        year = year == -1 ? date : year;
        if (date != year) {
            let yearData: Year = {
                type: 'year',
                id: id++,
                year: date
            }
            let index = data.findIndex(b => b.id == a.id);
            data.splice(index, 0, yearData);
            year = date;
        }
    }


}

//向数据中添加数据