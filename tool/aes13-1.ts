//读取环境变量
import { jie } from '../src/utils/cryptoUtils';
import { envStart } from '../src/utils/env';
envStart();

import { prisma } from "../src/config/prisma";


// 你的解密函数



const password = "A8412640";


async function convertAES2Base64() {
    try {
        // 查询全部dt数据
        const list = await prisma.dt.findMany({
            select: {
                dt_id: true,
                text: true,
            },
        });


        for (const item of list) {

            const text = item.text;

            // 判断是否AES加密
            if (!text || !text.startsWith("^AES^")) {
                continue;
            }


            try {

                // 去除 ^AES^
                const cipherText = text.substring(5);
                console.log(cipherText);
                

                // AES解密
                const plainText = jie(cipherText, password);

                console.log(plainText);
                
                // base64编码
                const base64Text = Buffer
                    .from(plainText)
                    .toString("base64");


                const newText = `^base64^${base64Text}`;


                // 写回数据库
                await prisma.dt.update({
                    where: {
                        dt_id: item.dt_id,
                    },
                    data: {
                        text: newText,
                    },
                });


                console.log(
                    `id=${item.dt_id} 转换成功`
                );


            } catch (err) {

                console.error(
                    `id=${item.dt_id} 转换失败`,
                    err
                );

            }
        }


    } finally {

        await prisma.$disconnect();

    }
}


convertAES2Base64();
