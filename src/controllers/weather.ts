import axios from "axios";
import express, { Request, Response } from 'express';
import { Reqs } from '../type';
import { getUrl } from "@/pathUtils";
import { getWeatherData } from "@/models/weather";


async function weatherData(req:Reqs,res:Response){    
    const data = await getWeatherData();
    return res.send( data);
}

export {weatherData}