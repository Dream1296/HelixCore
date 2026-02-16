import * as i2c from 'i2c-bus';
import { exec } from 'child_process';

import util from 'util';
import { getUrl } from '@/pathUtils';
// const aht10 = require(getUrl('assets', 'system/cNode', 'aht10.node'));


const execAsync = util.promisify(exec);

// const AHT10_ADDRESS = 0x38;


// // 延迟函数
// const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
// //Promise<{ temperature: number, humidity: number }>
// export async function readAHT10Data() {
//     let data: { temperature: Number, humidity: Number } = aht10.getAHT10Data('/dev/i2c-5');

//     return {
//         temperature: Number(data.temperature.toFixed(2)), // 保留两位小数
//         humidity: Number(data.humidity.toFixed(2)) // 保留两位小数
//     };

// const i2cBus = i2c.openSync(5); // 打开 I2C 总线 1

// try {
//     // 发送读取命令
//     i2cBus.writeByteSync(AHT10_ADDRESS, 0xAC, 0x33);
//     i2cBus.writeByteSync(AHT10_ADDRESS, 0xAC, 0x00);

//     // 延迟 80 毫秒，让传感器处理数据
//     await delay(80);

//     // 从传感器读取 6 字节数据
//     const data = Buffer.alloc(6);  // 创建一个 Buffer 来存储 6 字节数据
//     i2cBus.readI2cBlockSync(AHT10_ADDRESS, 0x00, 6, data);  // 使用 readI2cBlockSync 方法

//     // 解析湿度数据
//     const humidityRaw = (data[1] << 12) | (data[2] << 4) | (data[3] >> 4);
//     const humidity = (humidityRaw * 100.0) / 1048576.0;

//     // 解析温度数据
//     const temperatureRaw = ((data[3] & 0x0F) << 16) | (data[4] << 8) | data[5];
//     const temperature = (temperatureRaw * 200.0) / 1048576.0 - 50.0;

//     return {
//         temperature: Number(temperature.toFixed(2)), // 保留两位小数
//         humidity: Number(humidity.toFixed(2)) // 保留两位小数
//     };
// } catch (error) {
//     console.error('读取 AHT10 失败:', error);
//     return { temperature: -1, humidity: -1 };
// } finally {
//     i2cBus.closeSync(); // 关闭 I2C 总线
// }
// }

// readAHT10Data()
//     .then(a => {
//         console.log(a);

//     })


/**
 * 获取固态硬盘温度
 * @returns 
 */
export function getDiskNvmTemperature(): Promise<number> {
    return new Promise((resolve, reject) => {
        exec('smartctl -a /dev/nvme0 | grep "Temperature:"', (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }

            // 从输出中提取温度信息
            const temperatureMatch = stdout.match(/Temperature:\s*(\d+)\s*C/);
            if (temperatureMatch && temperatureMatch[1]) {
                resolve(Number(temperatureMatch[1]));
            } else {
                reject(-1);
            }
        });
    });
}

/**
 * 获取机械硬盘温度
 * @returns 
 */
export function getDiskTemperature(): Promise<number> {
    let diskDevice = '/dev/sda';
    return new Promise((resolve, reject) => {
        exec(`smartctl -a ${diskDevice} | grep "Temperature_Celsius" | awk '{print $10}'`, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }

            const temperature = stdout.trim();
            if (temperature) {
                resolve(Number(temperature));
            } else {
                reject(-1);
            }
        });
    });
}


/**
 * 获取风扇状态
 */
export async function getFan() {
    let a = await execAsync('gpio read 3');
    let nowFan = Number(a.stdout.slice(0, 1));
    return nowFan;
}

/**
 * 设置风扇状态
 */
export async function setFan(num: number) {
    let nowFan = await getFan();
    if (nowFan != num) {
        await execAsync('gpio write 3 ' + num);
    }
}