import { exec } from "child_process";
import util from "util";
import fs from 'fs';
import path from 'path';
import { md5Text } from "@/utils/cryptoUtils";

// type 0为文件夹，1为图片, 2为视频， 其他为3
type listFile = {
    name: string,
    type: 0 | 1 | 2 | 3,
    hash: string,
}

//所有路径均为实际的绝对路径
let imgCache = '/dream/HelixCore/assets/listCache';

export async function getList(pathStr: string): Promise<listFile[]> {
    let fileArr: listFile[] = [];
    try {
        // const files = await fs.promises.readdir(pathStr, { withFileTypes: true }); // 读取目录
        const files = await fastListDir(pathStr);
        for (let file of files) {
            if (file.type == 'directory') {
                fileArr.push({
                    name: file.name,
                    type: 0,
                    hash: '',
                })
                continue;
            }
            let type = getFileType(file.name);
            if (type == 1 || type == 2) {
                fileArr.push({
                    name: file.name,
                    type,
                    hash: getFileHash(file),
                })
                continue;
            }

            fileArr.push({
                name: file.name,
                type,
                hash: '',
            })


        }



        return fileArr;
    } catch (err) {
        console.error('Error reading directory:', err);
        return fileArr;
        // throw err;
    }

}



/**
 * 根据文件扩展名判断文件类型
 * @param {string} filename - 文件名（如 'example.jpg'）
 * @returns {number} 1=图片, 2=视频, 3=其他
 */
function getFileType(filename: string): 1 | 2 | 3 {
    // 获取文件扩展名（小写）
    const ext = path.extname(filename).toLowerCase();

    // 定义图片和视频的扩展名集合
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.mpeg'];

    // 判断文件类型
    if (imageExtensions.includes(ext)) {
        return 1; // 图片
    } else if (videoExtensions.includes(ext)) {
        return 2; // 视频
    } else {
        return 3; // 其他
    }
}


const execPromise = util.promisify(exec);

export interface FileInfo {
    name: string;        // 文件名
    size: number;        // 文件大小（字节）
    permissions: string; // 权限字符串，如 "-rw-r--r--"
    owner: string;       // 文件所有者
    group: string;       // 所属组
    date: string;        // 修改日期
    type: "file" | "directory" | "symlink" | "block" | "char" | "socket" | "pipe" | "unknown";
    fullPath: string;    // 完整路径
}

/**
 * 使用系统 `ls` 命令快速读取目录下文件信息
 * @param dir 目标目录路径
 */
export async function fastListDir(dir: string): Promise<FileInfo[]> {
    // 注意：加上 --time-style 以避免月份解析麻烦
    const cmd = `ls -lA --time-style=+%Y-%m-%d_%H:%M:%S ${path.resolve(dir)}`;
    const { stdout } = await execPromise(cmd);

    const lines = stdout.split("\n").filter(line => line && !line.startsWith("total"));
    const result: FileInfo[] = [];

    for (const line of lines) {
        // 示例：
        // drwxr-xr-x  2 root root     4096 2024-02-24_00:00:00 photos
        // -rw-r--r--  1 root root  1907866 2024-02-24_00:00:00 IMG_20231216_204846.jpg
        const parts = line.trim().split(/\s+/);
        if (parts.length < 7) continue;

        const permissions = parts[0];
        const owner = parts[2];
        const group = parts[3];
        const size = parseInt(parts[4], 10);
        const date = parts[5];
        const name = parts.slice(6).join(" ");

        // 从权限首字符判断文件类型
        const typeChar = permissions[0];
        let type: FileInfo["type"] = "unknown";
        switch (typeChar) {
            case "-": type = "file"; break;
            case "d": type = "directory"; break;
            case "l": type = "symlink"; break;
            case "b": type = "block"; break;
            case "c": type = "char"; break;
            case "s": type = "socket"; break;
            case "p": type = "pipe"; break;
        }

        result.push({
            name,
            size,
            permissions,
            owner,
            group,
            date,
            type,
            fullPath: path.join(dir, name),
        });
    }

    return result;
}


export function getFileHash(fileInfo:FileInfo){
    let str = fileInfo.name + fileInfo.size.toString() + fileInfo.date + fileInfo.fullPath;
    return md5Text(str);
}