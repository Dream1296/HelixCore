const db = require('../config/db/mysql');

const getPasswd = (user: string) => {
    return new Promise((resolve, reject) => {
        let dbStr = 'select passwd from passwd where user = ? ';
        try {
            db.query(dbStr, user, (err: any, results: any) => {
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

//创建新用户
const registerWrite = async (user: string, passwd: string) => {
    // 1. 检查用户是否已存在
    const existingUser = await prisma?.passwd.findFirst({
        where: {
            user: user,
        },
    });
    //如果存在，则直接返回false
    if(existingUser){
       return false; 
    }

    await prisma?.passwd.create({
        data: {
            user: user,
            passwd: passwd,
            name: '新建用户',
            zhiwen: 'null',
            zhiwens: 'null'
        }
    })
    return true;
}


export { getPasswd, registerWrite }



