// import mysql from 'mysql'
const mysql = require('mysql');
import { Key } from "@/utils/passwd";
//初始化mysql连接
//连接mysql

module.exports =  mysql.createPool({
    host:"127.0.0.1",
    user:"yw",
    password:Key.MYSQLPASSWD,
    database:"dream",
    port:3306,
});
