// import db from '../config/db/mysql';
const db = require('../config/db/mysql');

const getPasswd = (user: string) => {
    return new Promise((resolve, reject) => {
        let dbStr = 'select passwd from passwd where user = ? ';
        try {
            db.query(dbStr,user, (err: any, results: any) => {
                if (err) {
                    reject('0')
                }
                if (results.length > 0) {
                    resolve(results[0].passwd);
                }

                return results;
            })
        } catch {
            reject('0')
        }
    })
}


export {getPasswd}



