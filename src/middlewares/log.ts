import { Request, Response, NextFunction } from 'express';
import { ServerResponse } from 'http';
import moment from 'moment-timezone';
const db = require('@/config/db/mysql_log');

export function setLog(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    const originalJson = res.json;
    const originalSendFile = res.sendFile;
    let sendCalled = true;
    let jsonCalled = true;
    const start = Date.now(); // 记录请求开始时间

    // 使用 moment 格式化为 MySQL 可接受的时间格式 'YYYY-MM-DD HH:MM:SS'
    const startTime = moment(start).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

    const { method, path, url, query, body, headers } = req;


    // 请求的详细内容
    const requestHeaders = JSON.stringify(headers);
    const requestBody = JSON.stringify(body);
    const requestQuery = JSON.stringify(query);
    let resBody = "null";
    let file = "null";
    let ip = "127.0.0.1";

    // 判断 headers 中是否有 x-real-ip 参数，并确保它是一个字符串
    if ('x-real-ip' in headers) {
        const realIp = headers['x-real-ip'];
        if (Array.isArray(realIp)) {
            // 如果是数组，取第一个值
            ip = realIp[0];
        } else if (typeof realIp === 'string') {
            // 如果是字符串，直接赋值
            ip = realIp;
        }
    }

    if (req.file) {
        // 创建一个新的对象，去掉 buffer 字段
        let fileObj = { ...req.file } as any;

        // 去掉 buffer 字段
        delete fileObj.buffer;

        file = JSON.stringify(fileObj);
    }


    res.send = function (body: any): Response {
        if (sendCalled) {
            resBody = delData(body);
            sendCalled = false;
        }
        return originalSend.call(this, body);  // 调用原始 res.send 方法
    }

    res.json = function (body: any): Response {
        if (jsonCalled) {
            resBody = delData(body);
            jsonCalled = false;
        }

        return originalJson.call(this, body);  // 调用原始的 res.json 方法
    };

    res.sendFile = function (path: string, options?: any, callback?: (err: any) => void): void {
        resBody = `{"path":"${path}"}`
        // 如果需要处理回调，可以将其传入原始 sendFile 方法
        if (callback) {
            return originalSendFile.call(this, path, options, callback);
        } else {
            return originalSendFile.call(this, path, options);
        }
    };

    const serverRes = res as unknown as ServerResponse; // 类型断言

    serverRes.on('finish', (e: any) => {
        const duration = Date.now() - start;
        let sql = "INSERT INTO `dream_req_log` (`id`,`req_url`,`ip`, `req_query`, `req_headers`, `req_body`, `req.file`, `time_start`, `time_duration`, `res_body`) VALUES (NULL,?, ?,?,?,?,?,?,?,?);"
        dbSql(sql, [path, ip, requestQuery, requestHeaders, requestBody, file, startTime, duration, resBody], true)
            .then((len)=>{

            })
    });

    next();

}

// 删除响应体中正文数据
function delData(data: Object): string {
    let datas = JSON.stringify(data);
    let newResBody = JSON.parse(datas);

    if (newResBody && typeof newResBody === 'object' && 'data' in newResBody) {
        if (newResBody.data.length > 100) {
            newResBody.data = newResBody.data.length;
        }
    }
    return JSON.stringify(newResBody);
}




/**
 * 执行sql语句函数
 * @param sqlStr - 需要执行的sql语句
 * @param canshu - sql内待补全参数
 * @param isPut - 是否为查询，如果是返回影响行数
 * @returns 
 */
function dbSql<T>(sqlStr: string, canshu?: any[], isPut?: boolean): Promise<T> {
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
