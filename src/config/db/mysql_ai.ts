const mysql = require('mysql');
//初始化mysql连接
//连接mysql

module.exports = mysql.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.mysqlAI,
    port: 3306,
    charset: 'utf8mb4'
});