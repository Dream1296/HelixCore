import { Request, Response, NextFunction } from 'express';
import { ServerResponse } from 'http';

export function setLog(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    const start = Date.now(); // 记录请求开始时间
    const { method, url, query, body, headers } = req;

    // 请求的详细内容
    const requestHeaders = JSON.stringify(headers);
    const requestBody = JSON.stringify(body);
    const queryParams = JSON.stringify(query);
    let file = "null";
    if (req.file) {
        // 创建一个新的对象，去掉 buffer 字段
        let fileObj = { ...req.file } as any;

        // 去掉 buffer 字段
        delete fileObj.buffer;

        // 将文件信息转为 JSON 字符串
        file = JSON.stringify(fileObj);

        // console.log(file); // 打印转为 JSON 的文件信息
    }

    res.send = function (body: any): Response {
        console.log(body);
        return originalSend.call(this, body);  // 调用原始 res.send 方法
    }


    const serverRes = res as unknown as ServerResponse; // 类型断言

    serverRes.on('finish', (e: any) => {
        const duration = Date.now() - start;
        // console.log(headers);
        // console.log(req.file);
        // console.log(query);

    })
    next();
}