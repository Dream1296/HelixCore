import { dtidS } from "@/models/dt/dt";
import { user } from "@/type";


/**
 * 依照dt表中的loa进行鉴权，图片，视频等与动态权限完全一致的
 * @param username 用户id
 * @param dtid 请求的动态id
 * @param userDtID 当前用户是否限制访问
 * @returns 是否运行访问
 */
export async function hasAccessDtloa(User: user, dtid: number) {
    let userT1 = await prisma?.dt.findMany({
        where: {
            id: dtid
        },
        select: {
            user: true,
            loa: true,
            shows: true
        }
    })

    let userT: {
        user: string;
        loa: number;
        shows: boolean;
    };
    if (!userT1 || userT1.length != 1) {
        return false
    }
    userT = userT1[0];
    //如果访问的是已经删除的动态
    if (!userT.shows) {
        return false;
    }
    return hasAccess(userT, User,dtid);
}

// user从dt表中查，对应数据表中包含loa信息的
/**
 * 
 * @param User 用户鉴权对象
 * @param dtid
 * @param loa 
 * @returns 
 */
export async function hasAccessDtFileLoa(User: user, dtid: number,loa: number) {
    //从dt表中查用户
    let userM = await prisma?.dt.findMany({
        where: {
            id: dtid
        },
        select: {
            user: true
        }
    });
    // 如果不存在，则返回0
    if(!userM || userM.length != 1 ){
        return false;
    }
    return hasAccess({loa,user:userM[0].user}, User,dtid);
}




// 基础验证，传入user,loa,id，和用户鉴权对象
async function hasAccess(userT: { loa: number, user: string }, User: user,dtid:number) {
    //如果访问的公开内容
    if (userT.loa != undefined && userT.loa == 0) {
        return true;
    }
    //如果访问者和动态作者一样
    if (User.username == userT?.user && User.dtid == -1) {
        return true;
    }

    //如果是通过分享链接访问
    if (User.username == userT?.user && User.dtid == dtid) {
        return true;
    }

    // 如果当前用户在所选组内
    const groupIds = ((await prisma?.dt_group_view.findMany({
        where: { user: User.username },
        select: { group_id: true }
    })) ?? []).map(item => item.group_id);

    if (userT.loa >= 10 && groupIds.includes(userT.loa)) {
        return true;
    }

    return false;
}