import axios from "axios";
import express, { Request, Response } from 'express';
import { Reqs } from '../type';
import { getUrl } from "@/pathUtils";

async function weatherData(req:Reqs,res:Response){    
    

    const data = await axios.get('https://devapi.qweather.com/v7/weather/now?location=113.29,33.71&key=0c946a1f95634a889e29eb643f1e17c1');
    return res.send( data.data);
}

export {weatherData}