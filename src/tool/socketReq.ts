// socketRequest.ts
import http from "http";
import https from "https";
import { Buffer } from "node:buffer";
import  { Writable } from "node:stream";
import { ClientRequest, OutgoingHttpHeaders } from "node:http";

export let socketPathLib = process.env.socketPathLib! as string;
export let socketPathFs = process.env.socketPathFs! as string;

export type SocketRequestMethod = "GET" | "POST" | "PUT" | "DELETE";
export type SocketResponseType = "json" | "buffer" | "text";

export function createRequest(
    target: string,
    path: string,
    options: {
        method?: string;
        headers?: OutgoingHttpHeaders;
    },
    callback: (res: http.IncomingMessage) => void
): ClientRequest {
    if (/^https?:\/\//i.test(target)) {
        const url = new URL(target);
        const requestPath = path.startsWith("/") ? path : `/${path}`;
        const requestOptions = {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || undefined,
            path: requestPath,
            ...options,
        };

        return (url.protocol === "https:" ? https : http).request(
            requestOptions,
            callback
        );
    }

    return http.request(
        {
            socketPath: target,
            path,
            ...options,
        },
        callback
    );
}

export function socketRequest<T>(
    socket: 'lib' | 'fs' = 'lib',
    path: string,
    method: SocketRequestMethod = "GET",
    data?: any,
    responseType: SocketResponseType = "json",
    headers?: Record<string, string>,
    resStream ? :Writable
): Promise<{ data: T, header: any }> {
    return new Promise((resolve, reject) => {

        const canSendBody = method !== "GET" && method !== "DELETE" && data !== undefined && data !== null;
        // 判断是否是文件上传
        // const isFileUpload = canSendBody && data instanceof Buffer;

        // const isFileUpload = canSendBody && typeof data != 'string';
        const isResRequest =
            data !== null &&
            typeof data === "object" &&
            typeof (data as any).pipe === "function" &&
            typeof (data as any).on === "function";

        const isFileUpload = (canSendBody && Buffer.isBuffer(data)) || isResRequest;

        const finalHeaders: Record<string, string> = { ...headers };
        if (isFileUpload) {
            finalHeaders["Content-Type"] = "application/octet-stream";
        } else if (canSendBody) {
            finalHeaders["Content-Type"] = "application/json";
        }

        finalHeaders['Authorization'] = `${getmoduleToken()}`;

        let socketPath = socket === 'fs' ? socketPathFs : socketPathLib;


        const req = createRequest(
            socketPath,
            path,
            {
                method,
                headers: finalHeaders,
            },
            (res) => {
                const chunks: Buffer[] = [];
                let head = res.headers;
                 if (responseType === "buffer" && resStream) {

                    res.on("error", reject);
                    resStream.on("error", reject);

                    res.pipe(resStream);

                    resStream.on("finish", () => {
                        resolve({
                            data: undefined as T,
                            header: head
                        });
                    });
                    return;
                }

                res.on("data", (chunk) => {
                    chunks.push(chunk);
                });

     
                res.on("end", () => {
                    const buffer = Buffer.concat(chunks);

                    if (responseType === "buffer") {
                        resolve(
                            {
                                data: buffer as T,
                                header: head
                            }
                        );
                        return;
                    }

                    if (responseType === "text") {
                        resolve(
                            {
                                data: buffer.toString("utf-8") as T,
                                header: head
                            }
                        );
                        return;
                    }

                    // 默认尝试解析JSON
                    try {
                        resolve(
                            {
                                data: JSON.parse(buffer.toString("utf-8")) as T,
                                header: head
                            }
                        );
                    } catch (err) {
                        // 如果解析失败，直接返回文本
                        resolve(
                            {
                                data: buffer.toString("utf-8") as T,
                                header: head
                            }
                        );
                    }
                });
            }
        );

        req.on("error", reject);

        if (canSendBody) {
            if (isResRequest) {
                data.pipe(req); // 流入数据流
            } else if (isFileUpload) {
                req.write(data); // 直接写入 Buffer
                req.end();
            } else {
                req.write(JSON.stringify(data));
                req.end();
            }
        } else {
            req.end();
        }


    });
}



import { Request, Response } from "express";
import { IncomingHttpHeaders } from "node:http";
import { getmoduleToken } from "@/services/authorization";

export function forwardRequest(
    socket: 'lib' | 'fs' = 'lib',
    path: string,
    req: Request,
    res: Response,
    headers: Record<string, string> = {}
): void {

    const socketPath =
        socket === 'fs' ? socketPathFs : socketPathLib;

    const requestHeaders: IncomingHttpHeaders = {
        ...req.headers,
        ...headers,
    };
    requestHeaders["Authorization"] = `${getmoduleToken()}`;

    const proxyReq = createRequest(
        socketPath,
        path,
        {
            method: req.method,
            headers: requestHeaders,
        },
        (proxyRes) => {

            res.status(proxyRes.statusCode ?? 500);

            for (const [key, value] of Object.entries(proxyRes.headers)) {
                if (value !== undefined) {
                    res.setHeader(key, value);
                }
            }

            proxyRes.pipe(res);
        }
    );

    proxyReq.on("error", (err) => {
        if (res.headersSent) {
            res.destroy(err);
        } else {
            res.status(502).json({
                code: 502,
                message: "Forward request failed",
            });
        }
    });

    req.on("error", (err) => {
        proxyReq.destroy(err);
    });

    req.pipe(proxyReq);
}