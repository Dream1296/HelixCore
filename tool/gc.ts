// 判断图片是否为有效。

import { dbSql } from "../src/utils/dbSql";
import fs from 'fs';
import path from "path";


async function main() {
    let assets = path.join(__dirname, '../assets');
    let newDir = path.join(assets, 'recycle');
    let list = await dbSql<{ id: string, img_src: string }[]>('SELECT id,img_src FROM `dt_img`');
    const files = fs.readdirSync(path.join(assets, 'dtimg'));
    let i = 0;
    for (let file of files) {
        console.log(i + " / " + files.length);
        i++;

        let name = './dtimg/' + file;
        if (!isFileDir(name, list)) {
            let filebath = path.join(assets, 'dtimg', file);
            let newPath = path.join(newDir, file);
            try {
                fs.renameSync(filebath, newPath);
                console.log('文件移动成功');
            } catch (err) {
                console.error('文件移动失败:', err);
            }
        }
    }
}

async function b() {
    let assets = path.join(__dirname, '../assets');
    let list = await dbSql<{ id: string, img_src: string }[]>('SELECT id,img_src FROM `dt_img`');
    let files = fs.readdirSync(path.join(assets, 'dtimg'));
    files = files.map((obj) => obj = "./dtimg/" + obj);
    for (let a of list) {
        let nameDB = a.img_src;
        if (files.find(obj => obj == nameDB)) {

        } else {
            console.log(a);
        }

    }
    console.log("end");

}

async function c() {
    let list = await dbSql<{ id: string, img_src: string }[]>('SELECT id,img_src FROM `dt_img`');
    let set = new Set();
    for (let a of list) {
        set.add(a.img_src);
    }
    console.log(set.size);

}


async function dtimg_13() {
    let assets = path.join(__dirname, '../assets');
    let list = await dbSql<{ id: string, dt_id: string, img_src: string }[]>('SELECT id,dt_id,img_src FROM `dt_img`');
    let files = fs.readdirSync(path.join(assets, 'dtimg'));
    let id_13 = await dbSql<{ id: string }[]>('SELECT id FROM `dt` WHERE loa = 13');
    let id_13Arr = id_13.map(obj => obj.id);
    let i = 0;
    for (let a of list) {
        if (!id_13Arr.includes(a.dt_id)) {
            continue;
        }
        let old_path = path.join(assets, a.img_src);
        let new_path = path.join(assets, 'dtimg_13', a.img_src.slice(8));
        try {
            fs.renameSync(old_path, new_path);
            // console.log('文件移动成功');
        } catch (err) {
            console.log(a);
            console.error('文件移动失败:', err);
        }


        console.log(i + ' / ' + list.length);
        i++;
    }
    // console.log('end');

}

async function dt_img13_s() {
    let id_13 = await dbSql<{ id: string }[]>('SELECT id FROM `dt` WHERE loa = 13');
    let id_13Arr = id_13.map(obj => obj.id);
    let list = await dbSql<{ id: string, dt_id: string, img_src: string }[]>('SELECT id,dt_id,img_src FROM `dt_img`');
    for (let a of list) {
        if (!id_13Arr.includes(a.dt_id)) {
            continue;
        }
        let oldname = a.img_src;
        let newname = "./dtimg_13/" + oldname.slice(14);
        let flag = await dbSql("UPDATE `dt_img` SET `img_src` = ? WHERE `dt_img`.`id` = ?;", [newname, a.id], true);
        if (flag != 1) {
            console.error('错误', a);
        }



    }
    console.log('end');

}

async function d() {
    let list = await dbSql<{ id: string, dt_id: string, img_src: string }[]>('SELECT id,dt_id,img_src FROM `dt_img`');
    for (let a of list) {
        if (a.img_src.split('/').length != 3) {
            console.log(a);
        }
    }
    console.log('end');

}

async function dt_img_name() {
    let list = await dbSql<{ id: string, dt_id: string, img_src: string }[]>('SELECT id,dt_id,img_src FROM `dt_img`');
    for (let a of list) {
        let url = a.img_src.split('/')[1];
        let name = a.img_src.split('/')[2];
        if (Number(a.id) < 865) {
            continue
        }

        let flag = await dbSql("UPDATE dt_img SET img_src = ?, img_name = ? WHERE `dt_img`.`id` = ?;", [url, name, a.id], true);
        if (flag != 1) {
            console.error('错误', a);
        }


    }
    console.log('end');

}

dt_img_name();

// b();
// c();
// dtimg_13();
// dt_img13_s();
// d();

function isFileDir(file: string, dir: { id: string, img_src: string }[]) {
    for (let a of dir) {
        if (a.img_src == file) {
            return true;
        }
    }
    return false;
}

// main();
