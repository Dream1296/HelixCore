const mysql3 = require('mysql');


module.exports = mysql3.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.mysqlChat,
    port: 3306,
    charset: 'utf8mb4'
});
