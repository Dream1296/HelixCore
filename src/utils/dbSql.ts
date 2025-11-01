const dbDream = require('@/config/db/mysql');
const dbLog = require('@/config/db/mysql_log');
const dbAi = require('@/config/db/mysql_ai');
const dbChat = require('@/config/db/mysql_chat');
const dbFeel = require('@/config/db/mysql_feel');


/**
 * 执行sql语句函数
 * @param sqlStr - 需要执行的sql语句
 * @param canshu - sql内待补全参数
 * @param isPut - 是否为查询，如果是返回影响行数
 * @param dbC - 数据库句柄
 * @returns 
 */
export function dbSql<T>(sqlStr: string, canshu?: any[], isPut?: boolean, dbName?: "log" | "ai" | "dream" | "chat" | "feel"): Promise<T> {
    return new Promise((resolve, reject) => {
        let isPuts = !!isPut;  // 确保 isPuts 是布尔值
        let db = dbDream;
        if (dbName == 'log') {
            db = dbLog;
        }
        if (dbName == 'ai') {
            db = dbAi;
        }
        if (dbName == 'chat') {
            db = dbChat;
        }
        if (dbName == 'feel') {
            db = dbFeel
        }

        // 执行 SQL 查询
        db.query(sqlStr, canshu, (error: any, results: any) => {
            if (error) {
                console.log(error.message);

                return reject(error);
            }

            if (isPuts) {
                if (results.affectedRows !== undefined) {
                    return resolve(results.affectedRows); // 返回影响的行数
                } else {
                    return reject(0);
                }
            }
            return resolve(results);  // 返回查询结果
        });
    });
}
