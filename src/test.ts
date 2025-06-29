// import { getKeepBadmintonList } from "./models/dt";
// import { getUrl } from "./pathUtils";
import { envStart } from './utils/env';
import { upData } from "./services/dtList";
import { prisma } from './config/prisma';
import { formatString, mvFileName } from './utils/time';
import { getUrl } from './pathUtils';
import fs from 'fs';
import { isDtExist } from './models/dt/dt';
import moment from 'moment';
import { getLoaDate, setLoaDate } from './services/loaDate';
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

//将时间存入mysql
// async  function setdate(){
//     let dateArr:string[] = fs.readFileSync('/dream/HelixCore/src/ahda1.txt', 'utf8').split('\n');
//     dateArr = dateArr.filter(item => item.trim() !== '');
//     let dateArr1:Date[] = [];
//     for(let i = 0; i < dateArr.length; i++){
//         let d = moment(dateArr[i], 'YYYY-MM-DD HH:mm','Asia/Shanghai').toDate();
//         dateArr1.push( new Date(d.getTime() + 8 * 3600 * 1000) )

//     }

//     await prisma.dt_date.createMany({
//         data:dateArr1.map((item,index) => ({
//             date:item,
//         }))
//     })

    

// }

 
async function jisuan(){
    
}

async function main() {

    let a = await setLoaDate()

    console.log( a );
    
    
  
    


}

main();