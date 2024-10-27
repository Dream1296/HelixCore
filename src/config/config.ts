import { getUrl } from '@/pathUtils';
import path from 'path';
import express, { Request, Response } from 'express';
import fs from 'fs';
const configs = express();
const cors = require('cors');
const bodyParser = require('body-parser');   //post请求接收模块


configs.use(express.json()); // 用于解析 JSON 请求体 

// 使用 cors 中间件,解决跨域问题
configs.use(cors());

// 使用 body-parser 中间件来解析 JSON 数据
configs.use(bodyParser.json());

// // 读取 SSL 证书文件
// const privateKey = fs.readFileSync(path.join( getUrl('root','ssl') , 'private.key'), 'utf8');
// const certificate = fs.readFileSync( path.join(getUrl('root','ssl') , 'certificate.crt'), 'utf8');
// const caBundle = fs.readFileSync(path.join( getUrl('root','ssl') ,'ca_bundle.crt'), 'utf8');

// 读取 SSL 证书文件
const privateKey = fs.readFileSync(path.join(getUrl('root', 'ssl'), 'frp-fix.top.key'), 'utf8');
const certificate = fs.readFileSync(path.join(getUrl('root', 'ssl'), 'frp-fix.top.crt'), 'utf8');

// caBundle 可以留空，因为你是使用自签名证书
const caBundle = ''; // 或者根据需要提供证书链


// 配置 SSL 选项
const sslConfig = {
  key: privateKey,
  cert: certificate,
  ca: caBundle
};

export  {configs,sslConfig};