import axios from "axios";
import { Comtent, List } from "../type";


export async function dtAdd(dtData: List[]) {
    
    let a = await wyy();
    let data1: List = {
        user: "yw",
        name: a.name,
        touxian: a.touxian,
        text: a.content,
        img: '0',
        video: '0',
        date: (new Date()).toISOString(),
        id: "",
        idea: "0"
    }
    addDt(0, data1, dtData);
}

//网易云热评
async function wyy() {
    let data = await axios.get('https://api.uomg.com/api/comments.163');
    
    return {
        name: data.data.data.artistsname,
        touxian: data.data.data.avatarurl,
        content: data.data.data.content,
    }
}

function addDt(index: number, data: List, dtData: List[]) {



    let newData: List[];
    if (index >= dtData.length) {
        newData = [...dtData, data];
        let i = 0;
        newData.forEach(e => {
            dtData[i++] = e;
        })
        return
    }

    const arr = dtData.slice(0, index);
    const end = dtData.slice(index);
    newData = [...arr, data, ...end];
    let i = 0;
    newData.forEach(e => {
        dtData[i++] = e;
    })
}

