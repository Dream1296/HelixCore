// socketRequest.ts
import http from "http";

let socketPath = process.env.socketPath!;

export function socketRequest<T>(
	path: string,
	method: string = "GET",
	body?: any
): Promise<T> {
    console.log(socketPath);
    
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
				let data = "";

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					try {
						resolve(JSON.parse(data));
					} catch {
						resolve(data as T);
					}
				});
			}
		);

		req.on("error", reject);

		if (body) {
			req.write(JSON.stringify(body));
		}

		req.end();
	});
}