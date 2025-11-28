import { redisDB } from "@/config/db/redis";
import { dtList } from "@/models/dt/dt";
import { dtDataAdd } from "./dtDataAdd";
import { jiami } from "@/utils/cryptoUtils";
import { myEvent } from "./evenTs";





export async function upData(user: string, loa: number, aes: number) {

    let data = await dtList(user, Number(loa));
    // let datas = dtDataAdd(data);

    if (aes == 1) {
        let skey = '4563ee3b4e5cf38486ec2630c016785abbc0b21dabd9124e8550760ebd65';
        return jiami(data, skey);
    }
    return JSON.stringify(data);
}

export async function reDtListData() {
    let user = ['yw', 'guest'];
    let loa = [0, 1,13,12];
    let aes = [0, 1];

    for (let i = 0; i < user.length; i++) {
        for (let j = 0; j < loa.length; j++) {
            for (let m = 0; m < aes.length; m++) {
                let data = await upData(user[i], loa[j], aes[m]);
                setData(user[i], loa[j], aes[m], data);
            }
        }
    }
}




async function setData(user: string, loa: number, aes: number, value: string) {
    let key = user + loa + aes;
    await redisDB.set(key, value);
}

