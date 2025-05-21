import { getKeepBadmintonList } from "./models/dt";
import { getUrl } from "./pathUtils";
import { addDB, processImage } from "./services/imgdataArr";
import { vectorAdd } from "./services/vector";
import { dbSql } from "./utils/dbSql";

// getKeepBadmintonList()
//     .then((data)=>{
//         console.log(data);
//     })

// 调用函数并传入图片路径

// async function main(){
//     let data = await processImage(getUrl('root','assets/test.png'));
//     await addDB(data.blackArr,data.redArr);
//     console.log("ok");
    
// }

// main();

vectorAdd();

// async function a(){
//     let data = await dbSql<{id:number,img_name:string}[]>('SELECT * FROM `dt_img` WHERE id BETWEEN 2330 AND 2421;')
//     for(let a of data){
//         let str = a.img_name.split('/')[2];
//         console.log(a.img_name,str);
        
//         let c = await dbSql("UPDATE dt_img SET img_name = ? WHERE dt_img.id = ?;",[str,a.id]);
//     }
// }

// a();


