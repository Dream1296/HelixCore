const mysql4 = require('mysql');


module.exports = mysql4.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.mysqlFeel,
    port: 3306,
    charset: 'utf8mb4'
});
