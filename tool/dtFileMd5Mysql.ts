import fs from 'fs';
import crypto from "crypto";
//读取环境变量
import { envStart } from '../src/utils/env';
envStart;
import { dbSql } from '../src/utils/dbSql';
import { getUrl } from '../src/pathUtils';



function getFileMD5(path: string) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("md5");
        const stream = fs.createReadStream(path);

        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
}



async function main() {


    // const md5 = await getFileMD5(fileHome);
    let data = await dbSql<{ id: Number, file_src: string, has: string }[]>('SELECT * FROM `dt_file`');
    for (let a of data) {
        if (a.has == '-1') {
            console.log(a.file_src);
            let fileSrc = getUrl('assets', 'file', a.file_src);
            let hasStr = await getFileMD5(fileSrc);
            await dbSql("UPDATE `dt_file` SET `has` = ? WHERE `dt_file`.`id` = ?;", [hasStr, a.id]);
            console.log(hasStr, a.id);
        }


    }


    process.exit();
}



main();