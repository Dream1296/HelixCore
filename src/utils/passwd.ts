import fs from 'fs';
import path from 'path';

let key = JSON.parse( fs.readFileSync( path.join(__dirname,"../../key.json"),'utf-8'));

// 定义并导出配置
export const Key = {
  Password: key.tokenPasswd,
  MYSQLPASSWD:key.mysqlPasswd,
};
