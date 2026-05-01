const db = require('../config/db/mysql');

const getPasswd = (user: string) => {
    return prisma?.dt_user.findMany({
        where: {
            id: user,
        },
        select: {
            passwd: true
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
    if (existingUser) {
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



