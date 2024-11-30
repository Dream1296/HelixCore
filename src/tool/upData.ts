import { dbSql } from "@/utils/dbSql";
import { exec } from "child_process";


import util from 'util';

const execAsync = util.promisify(exec);

async function main(){
    let st = await execAsync(' cat /usr/games/ahda1.txt');
    let timeArr:string[] = st.stdout.split('\n');
        
    for(let date of timeArr){
        if(!date){
            continue;
        }
        let sql = `INSERT INTO dt_date  (date) VALUES (?)`;
        console.log(date);
        
        await dbSql(sql,[date]);
    }
    console.log('ok');
    

    
    
}

main();