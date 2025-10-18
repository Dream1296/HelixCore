import axios from "axios";
import { Comtent, Lists } from "../type";
import { weatherData } from "@/controllers/weather";
import { WeatherResponse, getWeatherData } from "@/models/weather";
import { getLoaDate, setLoaDate } from "./loaDate";

let wywData: { name: string, touxian: string, content: string };
let Weather: WeatherResponse;

//1009动态图片替换
let dataImgArr = [
    {
        dtid: 1009,
        index: 0,
        name: "uPjLN4y~0~IMG_20250627_185921-loa1.jpg",
    }
]

// let dataT: Lists = {
//     id: 999,
//     user: "yw",
//     name: "不爱吃糖",
//     touxian: "yw01.png",
//     text: "这是一个正文",
//     date: (new Date()).toISOString(),
//     imgShowAll: 0,
//     imgAllNum: 0,
//     videoNum: 0,
//     po: 0,
//     bgStyle: 0,
//     longText: [],
//     loa: 0
// }

async function loa13(dtData: Lists[]) {

    let data = dtData.find(e => e.id == 1010);
    if (!data) {
        return
    }
    let date = await getLoaDate();
    let text = `此轮服务器已连续运行${date.d}天${date.h}小时`;
    data.text = text;
    let dataCom = data.com?.pop()
    data.com = dataCom ? [dataCom] : [];

}

//拦截图片
export async function imgcl(imgSrc: { img_src: string; img_name: string; }, dtid: number, index: number, user?: string) {
    if (dtid == 1009 && index == 0 && user && user == 'yw') {
        imgSrc.img_name = dataImgArr[0].name;
    }

}

//拦截评论
export async function dtComPro(dtId: number, content: string) {
    if (dtId == 1010 && content == "刷新") {
        await setLoaDate();
    }

}

export async function dtAdd(dtData: Lists[], user: string, loa: number) {
    if (loa == 13) {
        await loa13(dtData);

    }

}

//
async function wywAdd(data: Lists) {
    let __data = { ...data };
    if (!wywData) {
        wywData = await getWyyData();
    }
    __data.name = wywData.name;
    // data.imgUrl = wywData.
    __data.text = wywData.content;
    __data.touxianUrl = wywData.touxian;

    getWyyData()
        .then(data => {
            wywData = data;
        })

    return __data;

}



//网易云热评
async function getWyyData() {
    let data = await axios.get('https://api.uomg.com/api/comments.163');

    return {
        name: data.data.data.artistsname,
        touxian: data.data.data.avatarurl,
        content: data.data.data.content,
    }
}


function addWeather(data: Lists) {

}

