const mysql2 = require('mysql');
//初始化mysql连接
//连接mysql

module.exports = mysql2.createPool({
    host:process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database:process.env.mysqlFY,
    port: 3306,
});