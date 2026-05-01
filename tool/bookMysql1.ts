import fs from 'fs';
import path from 'path';
import mysql2 from 'mysql2/promise';

type BookSentenceItem = {
    id: number;
    page: string;
    time: string;
    time_head: number;
    time_end: number;
    text: string;
    time_heads?: string;
    time_ends?: string;
};

type FileBookItem = {
    book_name: string;
    sentence_index: number;
    page: string;
    time: string;
    time_head: number;
    time_end: number;
    text: string;
    time_heads: string;
    time_ends: string;
};

const dataDir = path.resolve(process.cwd(), 'assets/bookData/dataJson');
const tableName = 'book_sentence';
const batchSize = 1000;

const bookPool = mysql2.createPool({
    host: 'localhost',
    user: 'yw',
    password: 'A8412640',
    database: 'book',
    port: 3306,
    charset: 'utf8mb4'
});

async function main() {
    await createTable();
    const files = getBookFiles(dataDir);

    console.log(`发现 ${files.length} 个小说文件`);

    for (const filePath of files) {
        const rows = readBookFile(filePath);
        if (rows.length === 0) {
            console.log(`跳过空文件: ${path.basename(filePath)}`);
            continue;
        }

        const bookName = getBookName(filePath);
        console.log(`开始导入: ${bookName}，共 ${rows.length} 句`);

        await execSql(`DELETE FROM ${tableName} WHERE book_name = ?`, [bookName]);

        for (let index = 0; index < rows.length; index += batchSize) {
            const batchRows = rows.slice(index, index + batchSize);
            await insertBatch(batchRows);
        }

        console.log(`导入完成: ${bookName}`);
    }

    console.log('全部导入完成');
}

async function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            book_name VARCHAR(255) NOT NULL COMMENT '小说名，取 json 文件名',
            sentence_index INT NOT NULL COMMENT '句子序号，对应 json 中的 id',
            page VARCHAR(50) NOT NULL DEFAULT '' COMMENT '页码',
            time VARCHAR(100) NOT NULL DEFAULT '' COMMENT '时间字段',
            time_head BIGINT NOT NULL DEFAULT -1 COMMENT '时间起点',
            time_end BIGINT NOT NULL DEFAULT -1 COMMENT '时间终点',
            text TEXT NOT NULL COMMENT '句子内容',
            time_heads VARCHAR(100) NOT NULL DEFAULT '' COMMENT '原始 time_heads',
            time_ends VARCHAR(100) NOT NULL DEFAULT '' COMMENT '原始 time_ends',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_book_sentence (book_name, sentence_index),
            KEY idx_book_name (book_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小说逐句存储表';
    `;

    await execSql(sql);
}

function getBookFiles(dirPath: string) {
    return fs
        .readdirSync(dirPath)
        .filter((fileName) => fileName.endsWith('.json'))
        .map((fileName) => path.join(dirPath, fileName))
        .sort();
}

function readBookFile(filePath: string): FileBookItem[] {
    const fileText = fs.readFileSync(filePath, 'utf8');

    const jsonData = JSON.parse(fileText) as BookSentenceItem[];
    const bookName = getBookName(filePath);

    return jsonData.map((item, index) => ({
        book_name: bookName,
        sentence_index: typeof item.id === 'number' ? item.id : index,
        page: item.page ?? '',
        time: item.time ?? '',
        time_head: Number.isFinite(item.time_head) ? item.time_head : -1,
        time_end: Number.isFinite(item.time_end) ? item.time_end : -1,
        text: item.text ?? '',
        time_heads: item.time_heads ?? '',
        time_ends: item.time_ends ?? ''
    }));
}

function getBookName(filePath: string) {
    const baseName = path.basename(filePath);
    if (baseName.endsWith('.json')) {
        return baseName.slice(0, -5);
    }
    return baseName;
}

async function insertBatch(rows: FileBookItem[]) {
    if (rows.length === 0) {
        return;
    }

    const valueSql = rows
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .join(', ');

    const sql = `
        INSERT INTO ${tableName}
        (book_name, sentence_index, page, time, time_head, time_end, text, time_heads, time_ends)
        VALUES ${valueSql}
    `;

    const params = rows.flatMap((row) => [
        row.book_name,
        row.sentence_index,
        row.page,
        row.time,
        row.time_head,
        row.time_end,
        row.text,
        row.time_heads,
        row.time_ends
    ]);

    await execSql(sql, params);
}

async function execSql(sql: string, params: any[] = []) {
    await bookPool.execute(sql, params);
}

main().catch((error) => {
    console.error('导入失败:', error);
    process.exit(1);
});
