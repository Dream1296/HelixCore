// import { getKeepBadmintonList } from "./models/dt";
// import { getUrl } from "./pathUtils";
import { envStart } from './utils/env';
import { upData } from "./services/dtList";
import { prisma } from './config/prisma';
import { formatString, mvFileName } from './utils/time';
import { getUrl } from './pathUtils';
import fs from 'fs';
// import { addDB, processImage } from "./services/imgdataArr";
// import { vectorAdd } from "./services/vector";
// import { dbSql } from "./utils/dbSql";
// envStart;
// getKeepBadmintonList()
//     .then((data)=>{
//         console.log(data);
//     })

// 调用函数并传入图片路径

// async function main(){
//     let data = await processImage(getUrl('assets','test.png'));
//     await addDB(data.blackArr,data.redArr);
//     console.log("ok");

// }

// main();

// vectorAdd();
// async function fn(){

//     let a = await  upData('yw',0,0);
//     console.log(a);
// }

// fn();


// async function a(){
//     let data = await dbSql<{id:number,img_name:string}[]>('SELECT * FROM `dt_img` WHERE id BETWEEN 2330 AND 2421;')
//     for(let a of data){
//         let str = a.img_name.split('/')[2];
//         console.log(a.img_name,str);

//         let c = await dbSql("UPDATE dt_img SET img_name = ? WHERE dt_img.id = ?;",[str,a.id]);
//     }
// }

// a();




async function main() {

    //    let urls = '/dream/HelixCore/assets/dtimgUpTemp';
    //     const files = fs.readdirSync(urls);
    //     let falg = fs.existsSync(urls);
    //     console.log(files);
    let arr = await prisma.dt_video.findMany();
    for (let a of arr) {
        let video_name = a.video_name;
        let nameArr = video_name.split('/')
        await prisma.dt_video.update({
            where: {
                id: a.id
            },
            data: {
                video_name: nameArr[2],
                video_src: nameArr[1]
            }
        })
        console.log(a.id);
        

    }



}

main();