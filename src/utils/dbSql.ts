const db = require('@/config/db/mysql');


/**
 * 执行sql语句函数
 * @param sqlStr - 需要执行的sql语句
 * @param canshu - sql内待补全参数
 * @param isPut - 是否为查询，如果是返回影响行数
 * @returns 
 */
export function dbSql<T>(sqlStr: string, canshu?: any[], isPut?: boolean): Promise<T> {
    return new Promise((resolve, reject) => {
        let isPuts = !!isPut;  // 确保 isPuts 是布尔值

        // 执行 SQL 查询
        db.query(sqlStr, canshu, (error: any, results: any) => {
            if (error) {
                return reject(error);  
            }

            if (isPuts) {
                if (results.affectedRows !== undefined) {
                    return resolve(results.affectedRows); // 返回影响的行数
                }else{
                    return reject(0);
                }
            }
            return resolve(results);  // 返回查询结果
        });
    });
}
