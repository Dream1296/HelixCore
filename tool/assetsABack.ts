/**
 * backupSplit.ts
 *
 * 修改说明：
 * - 备份 /dream/HelixCore/assets/a/2024 下的所有文件（包括根目录文件）
 * - 原文件不动，只复制
 * - 压缩包生成后不删除临时目录
 * - 每个压缩包生成之间等待指定时间（单位：秒）
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/* =========================
   配置区（直接修改这里）
========================= */
const SOURCE_DIR = "/dream/HelixCore/assets/a/2025"; // 要备份的目录
const SPLIT_COUNT = 4; // 分成几个包
const PASSWORD = "xxx"; // 压缩密码
const PARITY_PERCENT = 10; // 冗余比例
const WAIT_SECONDS = 120; // 每个压缩包生成之间等待时间
/* ========================= */

/** 文件结构 */
interface FileEntry {
  fullPath: string;
  relativeDir: string;
  fileName: string;
}

/** Fisher-Yates 随机打乱 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/** 获取完整目录树（包含空目录） */
function getAllDirectories(root: string, current = ""): string[] {
  const currentPath = path.join(root, current);
  let dirs: string[] = [current];

  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      dirs = dirs.concat(getAllDirectories(root, path.join(current, item.name)));
    }
  }

  return dirs;
}

/** 获取所有文件，包括根目录文件和子目录文件 */
function getAllFiles(root: string, current = ""): FileEntry[] {
  const currentPath = path.join(root, current);
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  let result: FileEntry[] = [];

  for (const item of items) {
    if (item.isFile()) {
      result.push({
        fullPath: path.join(currentPath, item.name),
        relativeDir: current,
        fileName: item.name
      });
    } else if (item.isDirectory()) {
      result = result.concat(getAllFiles(root, path.join(current, item.name)));
    }
  }

  return result;
}

/** 创建完整目录结构 */
function createDirectoryStructure(allDirs: string[], targetRoot: string) {
  for (const dir of allDirs) {
    fs.mkdirSync(path.join(targetRoot, dir), { recursive: true });
  }
}

/** 复制单文件 */
function copyFile(file: FileEntry, targetRoot: string) {
  const targetDir = path.join(targetRoot, file.relativeDir);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(file.fullPath, path.join(targetDir, file.fileName));
}

/** 检查命令是否存在 */
function checkCommand(command: string) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
  } catch {
    throw new Error(`缺少依赖命令: ${command}\n请安装后再运行`);
  }
}

/** 主备份流程 */
function runBackup() {
  console.log("开始检查环境...");

  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`源目录不存在: ${SOURCE_DIR}`);
  }

  checkCommand("7z");
  checkCommand("par2");

  const parentDir = path.dirname(SOURCE_DIR);
  const sourceName = path.basename(SOURCE_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(parentDir, `${sourceName}_back_${timestamp}`);

  fs.mkdirSync(backupRoot, { recursive: true });
  console.log(`备份根目录: ${backupRoot}`);

  /** 获取原始目录结构 */
  const allDirs = getAllDirectories(SOURCE_DIR);

  /** 创建分片目录 */
  const splitDirs: string[] = [];
  for (let i = 1; i <= SPLIT_COUNT; i++) {
    const splitDir = path.join(backupRoot, `${sourceName}_back_${i}`);
    fs.mkdirSync(splitDir, { recursive: true });
    createDirectoryStructure(allDirs, splitDir);
    splitDirs.push(splitDir);
    console.log(`结构完成: ${splitDir}`);
  }

  /** 获取文件 */
  const allFiles = getAllFiles(SOURCE_DIR);

  /** 按叶子目录分组 */
  const groupMap = new Map<string, FileEntry[]>();
  for (const file of allFiles) {
    if (!groupMap.has(file.relativeDir)) groupMap.set(file.relativeDir, []);
    groupMap.get(file.relativeDir)!.push(file);
  }

  console.log("开始随机分配文件...");

  /** 每个叶子目录随机分配 */
  for (const [, files] of groupMap) {
    const shuffled = shuffleArray(files);
    shuffled.forEach((file, index) => {
      const targetIndex = index % SPLIT_COUNT;
      copyFile(file, splitDirs[targetIndex]);
    });
  }

  console.log("文件分配完成");

  /** 压缩 + par2 */
  for (const splitDir of splitDirs) {
    const archivePath = `${splitDir}.7z`;


    console.log(`压缩中: ${archivePath}`);
    execSync(`7z a -t7z "${archivePath}" "${splitDir}" -mx=0 -p"${PASSWORD}" -mhe=on`, {
      stdio: "inherit"
    });
    console.log(`等待${WAIT_SECONDS}秒后开始进行冗余文件生成`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, WAIT_SECONDS * 1000);

    console.log(`生成 ${PARITY_PERCENT}% PAR2 冗余...`);
    execSync(`par2 create -r${PARITY_PERCENT} "${archivePath}.par2" "${archivePath}"`, {
      stdio: "inherit"
    });
    

    console.log(`等待 ${WAIT_SECONDS} 秒后生成下一个压缩包...`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, WAIT_SECONDS * 1000);
  }

  console.log("\n全部完成");
  console.log(`输出目录: ${backupRoot}`);
}

/** 启动 */
try {
  runBackup();
} catch (error) {
  console.error("\n发生错误:", error instanceof Error ? error.message : error);
  process.exit(1);
}