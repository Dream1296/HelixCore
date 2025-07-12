const mysql1 = require('mysql');


module.exports = mysql1.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.mysqlDreamName,
    port: 3306,
    charset: 'utf8mb4'
});
