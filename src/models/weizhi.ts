const db = require('../config/db/mysql');


export function userWeizhi(user: string) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT jindu, weidu  
        FROM gps  
        WHERE id = (SELECT MAX(id) FROM gps WHERE user = ?) AND user = ?;`
        db.query(sql, [user,user], (err: any, results: { jindu: number, weidu: number }[]) => {
            if (err) {
                reject('0')
            }
            if (results.length > 0) {
                resolve(results[0]);
            }
        })
    })
}

export function SetuserWeizhi(user: string,jindu:number,weidu:number){


    return new Promise((resolve, reject) => {
        if(user == 'a'){
            user = 'b'
        }else{
            user = 'a'
        }
        const sql = `INSERT INTO gps (id, user, jindu, weidu) 
        VALUES (NULL, ?, ?, ?);`
        db.query(sql, [user,jindu,weidu], (err: any, results: any) => {
            if (err) {
                reject('0')
            }
            if (results.length > 0) {
                resolve(results[0]);
            }
        })
    })
}