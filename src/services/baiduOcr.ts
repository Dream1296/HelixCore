import { getUrl } from '@/pathUtils';
import { dbSql } from '@/utils/dbSql';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
const AK = "MvqIzWfYpiqFXYe4aNCpNcvP"
const SK = "Em4Q0L3m7VAPQlFOCCRFyDWocTqrSO37"

/**
 * 
 * @param  imageBase64  - 图片base64编码
 * @returns 
 */



export async function baiduOcr(imageBase64: string) {
    // 读取图片文件并转换为base64
    // const imageFile = fs.readFileSync(imagePath);
    // const imageBase64 = imageFile.toString('base64');
    // console.log(imageBase64);
        // console.log(imageBase64);
        
    // 构造请求参数
    const params = new URLSearchParams();
    var options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=' + await getAccessToken(),
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        data: {
            'image': imageBase64
        }
    };

    let po = await axios(options);
    return po.data;
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    }
    return new Promise((resolve, reject) => {
        axios(options)
            .then(res => {
                resolve(res.data.access_token)
            })
            .catch(error => {
                reject(error)
            })
    })
}
