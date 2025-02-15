const mysql = require('mysql');
import { Key } from "@/utils/passwd";
//初始化mysql连接
//连接mysql

module.exports =  mysql.createPool({
    host:"127.0.0.1",
    user:"yw",
    password:Key.MYSQLPASSWD,
    database:"FlowYear",
    port:3306,
});