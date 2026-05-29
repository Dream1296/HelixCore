//读取环境变量
import { envStart } from '@/utils/env';
envStart;

import { getUrl } from '@/pathUtils';
import fs from 'fs';
import path from 'path';


// const rootPath = getUrl('src','./');   
const rootPath = '/dream/an/src'; 


// 需要统计的文件后缀
const exts = ['.ts'];

// 是否忽略的目录
const ignoreDirs = [
	'node_modules',
	'dist',
	'.git'
];

type FileStat = {
	file: string;
	lines: number;
};

const result: FileStat[] = [];

/**
 * 递归遍历目录
 */
function walk(dir: string) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const fullPath = path.join(dir, file);

		const stat = fs.statSync(fullPath);

		// 跳过忽略目录
		if (stat.isDirectory()) {
			if (ignoreDirs.includes(file)) {
				continue;
			}

			walk(fullPath);
			continue;
		}

		// 判断后缀
		const ext = path.extname(file);

		if (!exts.includes(ext)) {
			continue;
		}

		// 读取文件内容
		const content = fs.readFileSync(fullPath, 'utf-8');

		// 计算行数
		const lines = content.split(/\r?\n/).length;

		result.push({
			file: fullPath,
			lines
		});
	}
}

// 开始遍历
walk(rootPath);

// 按行数排序
result.sort((a, b) => b.lines - a.lines);

// 计算总行数
const totalLines = result.reduce((sum, item) => sum + item.lines, 0);

// 输出结果
console.log('\n========= 文件行数统计 =========\n');
console.log(`总代码行数: ${totalLines}`);
console.log(`文件数量: ${result.length}`);
console.log('\n===============================');

for (const item of result) {
	console.log(`${item.lines.toString().padStart(6)} 行  ${item.file}`);
}

