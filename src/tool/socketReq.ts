// socketRequest.ts
import http from "http";

let socketPathLib = process.env.socketPathLib! as string;
let socketPathFs = process.env.socketPathFs! as string;

export type SocketRequestMethod = "GET" | "POST" | "PUT" | "DELETE";
export type SocketResponseType = "json" | "buffer" | "text";

export function socketRequest<T>(
    socket: 'lib' | 'fs' = 'lib',
    path: string,
    method: SocketRequestMethod = "GET",
    data?: any,
    responseType: SocketResponseType = "json",
): Promise<{ data: T, header: any }> {
    return new Promise((resolve, reject) => {

        const canSendBody = method !== "GET" && method !== "DELETE" && data !== undefined && data !== null;
        // 判断是否是文件上传
        const isFileUpload = canSendBody && data instanceof Buffer;

        const headers: Record<string, string> = {};
        if (isFileUpload) {
            headers["Content-Type"] = "application/octet-stream";
        } else if (canSendBody) {
            headers["Content-Type"] = "application/json";
        }

        let socketPath = socket === 'fs' ? socketPathFs : socketPathLib;


        const req = http.request(
            {
                socketPath,
                path,
                method,
                headers,
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
            if (isFileUpload) {
                req.write(data); // 直接写入 Buffer
            } else {
                req.write(JSON.stringify(data));
            }
        }

        req.end();
    });
}