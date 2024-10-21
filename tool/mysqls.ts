import {sqlC} from '../src/models/dt';


videos();


//图片总数计算
async function imgNum() {
    let dtData = await sqlC('SELECT id,img FROM dt') as { id: number, img: string }[];

    for (let a of dtData) {
        if (a.img == '0' || a.img == '') {
            continue;
        }
        let num = a.img.split('-').length;
        await sqlC(`UPDATE dt SET img_all_num = '${num}' WHERE dt.id = ${a.id};`)
    }
    console.log('OK');
}


//图片显示数
async function imgShowNum() {
    let dtData = await sqlC('SELECT id,img FROM dt') as { id: number, img: string }[];

    for (let a of dtData) {
        if (a.img == '0' || a.img == '') {
            continue;
        }
        let num = a.img.split('-').length;
       num = num > 6 ? 6:num;
        await sqlC(`UPDATE dt SET img_show_num = '${num}' WHERE dt.id = ${a.id};`)
    }
    console.log('OK');
}

//视频数
async function videoNum() {
    let dtData = await sqlC('SELECT id,video FROM dt') as { id: number, video: string }[];

    for (let a of dtData) {
        if (a.video == '0' || a.video == '') {
            continue;
        }
        let num = a.video.split('-').length;
        await sqlC(`UPDATE dt SET video_num = '${num}' WHERE dt.id = ${a.id};`)
    }
    console.log('OK');
    
}

//图片插入到dt_img
export async function imgs() {
    let i = 0;
    let dtData = await sqlC('SELECT id,img FROM dt') as { id: number, img: any }[];
    for (let a of dtData) {
        if (a.img == '0' || a.img == '') {
            continue;
        }

        let arr = a.img.split('-');
        let index = 0;
        for (let b of arr) {

            let sql = `INSERT INTO dt_img (id, dt_id, img_index, img_src, text) VALUES (NULL, ${a.id}, ${index}, '${b}', NULL);`
            await sqlC(sql);

            index++;
        }
    }
    console.log('OK');
    
}



//视频插入到dt_video
async function videos() {
    let i = 0;
    let dtData = await sqlC('SELECT id,video FROM dt') as { id: number, video: string }[];
    // return


    for (let a of dtData) {
        if (a.video == '0') {
            continue;
        }

        let arr = a.video.split('-');
        let index = 0;
        for (let b of arr) {

            let sql = `INSERT INTO dt_video (id, dt_id, video_index, video_src) VALUES (NULL, ${a.id}, ${index}, '${b}');`
    
            await sqlC(sql);
            index++;
        }
    }
}