// socketRequest.ts
import http from "http";

let socketPath = process.env.socketPath! as string;


export function socketRequest<T>(
	path: string,
	method?: "GET" | "POST" | "PUT" | "DELETE",
	data?: any,         // 请求体
	responseType?: "json" | "buffer", // 默认 json): Promise<T> {
):Promise<T> {
	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				socketPath,
				path,
				method,
				headers: {
					"Content-Type": "application/json",
				},
			},
			(res) => {
				const chunks: Buffer[] = [];

				res.on("data", (chunk) => {
					chunks.push(chunk);
				});

				res.on("end", () => {
					const buffer = Buffer.concat(chunks);

					if (responseType === "buffer") {
						resolve(buffer as T);
						return;
					}

					// 默认尝试解析JSON
					try {
						resolve(JSON.parse(buffer.toString("utf-8")) as T);
					} catch (err) {
						// 如果解析失败，直接返回文本
						resolve(buffer.toString("utf-8") as T);
					}
				});
			}
		);

		req.on("error", reject);

		if (data) {
			req.write(JSON.stringify(data));
		}

		req.end();
	});
}

