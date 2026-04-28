const mysql5 = require('mysql');


module.exports = mysql5.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.mysqlBook,
    port: 3306,
    charset: 'utf8mb4'
});
