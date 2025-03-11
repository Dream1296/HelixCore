import axios from "axios";


// 定义 Now 类型
interface Now {
    obsTime: string;
    temp: string;
    feelsLike: string;
    icon: string;
    text: string;
    wind360: string;
    windDir: string;
    windScale: string;
    windSpeed: string;
    humidity: string;
    precip: string;
    pressure: string;
    vis: string;
    cloud: string;
    dew: string;
}

// 定义 Refer 类型
interface Refer {
    sources: string[];
    license: string[];
}

// 定义主响应类型
export interface WeatherResponse {
    code: string;
    updateTime: string;
    fxLink: string;
    now: Now;
    refer: Refer;
}

export async function getWeatherData():Promise<WeatherResponse>{
    const data = await axios.get('https://devapi.qweather.com/v7/weather/now?location=113.29,33.71&key=0c946a1f95634a889e29eb643f1e17c1');
    return data.data;
}