// socketRequest.ts
import http from "http";
import { Buffer } from "node:buffer";

export let socketPathLib = process.env.socketPathLib! as string;
export let socketPathFs = process.env.socketPathFs! as string;

console.log(socketPathFs);

export type SocketRequestMethod = "GET" | "POST" | "PUT" | "DELETE";
export type SocketResponseType = "json" | "buffer" | "text";

export function socketRequest<T>(
    socket: 'lib' | 'fs' = 'lib',
    path: string,
    method: SocketRequestMethod = "GET",
    data?: any,
    responseType: SocketResponseType = "json",
    headers?: Record<string, string>
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

        let socketPath = socket === 'fs' ? socketPathFs : socketPathLib;


        const req = http.request(
            {
                socketPath,
                path,
                method,
                headers: finalHeaders,
            },
            (res) => {
                const chunks: Buffer[] = [];
                let head = res.headers;
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



