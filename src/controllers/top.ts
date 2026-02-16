import express, { Request, Response } from 'express';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { getFan, setFan } from '@/services/sensor';
import { number } from 'io-ts';

const execAsync = util.promisify(exec);

// 获取IPv6地址
async function getIpv6(req: Request, res: Response) {
    const networkInterfaces = os.networkInterfaces();
    let foundIPv6 = false;

    for (const iface of Object.keys(networkInterfaces)) {
        const addresses = networkInterfaces[iface];
        if (!addresses) continue;

        for (const address of addresses) {
            if (address.family === 'IPv6' && !address.internal && !foundIPv6) {
                foundIPv6 = true;
                res.send(address.address);
                return;
            }
        }

        if (foundIPv6) break;
    }

    if (!foundIPv6) {
        res.status(404).send('IPv6 address not found');
    }
}

export async function getIp(req: Request, res: Response) {
    let ip = "127.0.0.1";
    const { method, path, url, query, body, headers } = req;
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
    res.send({
        code: 200,
        ip: ip
    });




}

// 获取性能信息
async function xnlist(req: Request, res: Response) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
    });
    // console.log('top');

    const sendPerformanceData = async () => {

        try {
            const data = await getdata();

            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error: any) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        }

    };

    const intervalId = setInterval(sendPerformanceData, 2000);

    req.on('close', () => {
        clearInterval(intervalId);
    });

    // Send initial data immediately
    await sendPerformanceData();
}

// 工具函数 - 获取温度信息
function getTemperatureInfo(): Promise<{ cpuTemperature: number; gpuTemperature: number }> {
    return new Promise((resolve, reject) => {
        exec('sensors', (error, stdout, stderr) => {
            if (error) {
                reject(`执行 sensors 命令时出错: ${error.message}`);
                return;
            }

            const cpuTemperatureRegex = /bigcore\d+_thermal-virtual-0\s*\n.*temp1:\s*([+-]?\d+\.\d+)/;
            const gpuTemperatureRegex = /gpu_thermal-virtual-0\s*\n.*temp1:\s*([+-]?\d+\.\d+)/;

            const cpuMatch = stdout.match(cpuTemperatureRegex);
            const gpuMatch = stdout.match(gpuTemperatureRegex);

            if (cpuMatch && cpuMatch[1] && gpuMatch && gpuMatch[1]) {
                const cpuTemperature = parseFloat(cpuMatch[1]);
                const gpuTemperature = parseFloat(gpuMatch[1]);
                resolve({ cpuTemperature, gpuTemperature });
            } else {
                const allTemperatureRegex = /\btemp1:\s*([+-]?\d+\.\d+)/;
                const allMatch = stdout.match(allTemperatureRegex);

                if (allMatch && allMatch[1]) {
                    const temperature = parseFloat(allMatch[1]);
                    resolve({ cpuTemperature: temperature, gpuTemperature: temperature });
                } else {
                    reject('无法解析 sensors 输出中的 CPU 或 GPU 温度信息。');
                }
            }
        });
    });
}


// 获取数据
interface Data {
    cpuTemperature: string | number;
    gpuTemperature: string | number;
    sddisk: string;
    ssddisk: string;
    cpuUsage: string | number;
    memoryUsage: string;
    fenSanNun: string | number;
    aht10: {
        temperature: number;
        humidity: number;
    },
}
async function getdata(): Promise<Data> {


    const data: Data = {
        cpuTemperature: 'N/A',
        gpuTemperature: 'N/A',
        sddisk: 'N/A',
        ssddisk: 'N/A',
        cpuUsage: 'N/A',
        memoryUsage: 'N/A',
        fenSanNun: NaN,
        aht10: {
            temperature: -1,
            humidity: -1,
        },
    };

    try {
        const { cpuTemperature, gpuTemperature } = await getTemperatureInfo();
        data.cpuTemperature = cpuTemperature;
        data.gpuTemperature = gpuTemperature;
    } catch (error) {
        data.cpuTemperature = 'N/A';
        data.gpuTemperature = 'N/A';
    }

    try {
        const { stdout: disk1 } = await execAsync("df -h | awk '$NF==\"/\"{print $5}'");
        const { stdout: disk2 } = await execAsync("df -h | grep '/dream' | awk '{print $5}'");
        data.sddisk = disk1.trim();
        data.ssddisk = disk2.trim();
    } catch (error) {
        data.sddisk = 'N/A';
        data.ssddisk = 'N/A';
    }

    try {
        const cpuUsageCommand = "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'";
        const memoryUsageCommand = "free -m | awk 'NR==2{printf \"%.2f%%\\n\", $3*100/$2 }'";

        const { stdout: performanceOutput } = await execAsync(`${cpuUsageCommand}; ${memoryUsageCommand}`);
        const lines = performanceOutput.split('\n');

        data.cpuUsage = parseFloat(lines[0].trim());
        data.memoryUsage = lines[1].trim();
    } catch (error) {
        data.cpuUsage = 'N/A';
        data.memoryUsage = 'N/A';
    }

    try {
        const fenSan = "gpio read 3";
        const { stdout: fenSanNun } = await execAsync(fenSan);
        data.fenSanNun = fenSanNun.slice(0, 1);
    } catch {
        data.fenSanNun = NaN;
    }

    // data.aht10 = await readAHT10Data();
    data.aht10 = { temperature: -1, humidity: -1 };

    return data;
}






async function setFanL(req: Request, res: Response) {
    let falg = Number(req.query.Fan);
    let nowFan = await getFan();
    if ((falg == 1 || falg == 0)) {
        if (nowFan == falg) {
            return res.send({
                code: 200,
                fan: nowFan,
            })
        }
        await setFan(falg);
        nowFan = await getFan();
        return res.send({
            code: 200,
            fan: nowFan,
        })
    }
    if (!falg) {
        return res.send({
            code: 400,
            fan: -1,
        })
    }
}

export { xnlist, getIpv6, setFanL };
