import { getUrl } from '@/pathUtils';
import fs from 'fs';
import path from 'path';

let key = JSON.parse( fs.readFileSync( path.join(getUrl('root','key.json')),'utf-8'));

// 定义并导出配置
export const Key = {
  Password: key.tokenPasswd,
  MYSQLPASSWD:key.mysqlPasswd,
  B13:key.b13Passwd,
};
