import axios from "axios";
import { Comtent, List, Lists } from "../type";
import { weatherData } from "@/controllers/weather";
import { WeatherResponse, getWeatherData } from "@/models/weather";

let wywData:{name:string,touxian:string,content:string};
let Weather:WeatherResponse;
export async function dtAdd(dtData: Lists[]) {
    let data: Lists = {
        id: "999",
        user: "yw",
        name: "",
        touxian: "",
        touxianUrl:"",
        text: "",
        date: (new Date()).toISOString(),
        imgShowAll: 0,
        imgAllNum: 0,
        videoNum: 0,
        imgUrl:"",
        po: 0,
        bgStyle: 0,
        textTile: "",
        loa: 0
    }
    // getWeatherDatas()
    // let data1 = await wywAdd(data);
    let data1;
    // let data2 = 
    return [data1 , ...dtData ];


    // addDt(0, data1, dtData);
}

//
async function wywAdd(data: Lists){
    let __data = {...data};
    if(!wywData){
        wywData = await getWyyData();
    }
    __data.name = wywData.name;
    // data.imgUrl = wywData.
    __data.text = wywData.content;
    __data.touxianUrl = wywData.touxian;

    getWyyData()
        .then(data =>{
            wywData = data;
        })

    return __data;

}


async function getWyyData() {
    let data = await axios.get('https://api.uomg.com/api/comments.163');
    
    return {
        name: data.data.data.artistsname,
        touxian: data.data.data.avatarurl,
        content: data.data.data.content,
    }
}
 

function addWeather(data: Lists){

}

