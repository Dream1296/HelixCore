import { getUrl } from "@/pathUtils";
import { dbSql } from "@/utils/dbSql";
import path from "path";
import { baiduOcr } from "./baiduOcr";
import sharp from "sharp";
import express, { Request, Response } from 'express';
import { deep } from "./deepseek";
import fs from 'fs';
import { KeepRunRecord, BadmintonData } from "@/type";

let logDir = getUrl('root','temp', "abc.log");


export async function pollingKeepRun() {
    let idListDb = await dbSql<{ dt_id: string }[]>("SELECT dt_id FROM `dt_index` WHERE keyword = 'keep跑步'");
    let idList = idListDb.map((obj) => obj.dt_id);
    for (let a of idList) {
        //这里可能会抛出错误
        await keepRunOcr(a);
        console.log('转换' + a);
    }
    console.log('更新完成');

}

export async function keepBadminton(dtid: string) {
    //查询是否存在
    let sql = `SELECT id FROM keep_badminton WHERE dt_id = ?`;
    let len = await dbSql<[]>(sql, [dtid]);

    if (Number(len.length) != 0) {
        console.log('已存在');
        return
    }

    let data = await ocrStart(Number(dtid), 1);
    let ocrText = JSON.stringify(data);

    //(keep_badminton)
    let typeData = `{
        "type": "羽毛球",
        "date": "2025/03/01 18:30-20:21",
        "xiaohao(运动消耗，单位千卡)": "76",
        "xinlv(平均心率)": "160",
        "xinlv_min(最小心率)":"100",
        "xinlv_max(最大心率)": "182",
        "time_m(训练时长)": "06:24",
        "time_all(总时长)": "08:18",
        "fuzai(运动负载)": "22",
        "xunlanxiaoguo_you(训练效果，有氧)": "2.1",
        "xunlanxiaoguo_wu(训练效果，无氧)": "1.1",
    }`;

    let con = `我将我的运动记录截屏通过orc进行识别，因为大小限制，我将图片一份为二，然后对每张图片依次进行了识别
    ,识别结果中包含文字的内容和位置，然后根据这些帮我提取里面的主要信息，返回一个json字符串。返回内容只包含json字符串,直接输出json字符串，不包含换行等特殊字符，保证您输出的内容直接可以js中JSON.parse函数直接解析为对象。
    其实json字符串示例为${typeData},在这个输出中，属性名后面的小括号里的内容标注这个字段是记录什么内容的，请按照ocr识别结果中找到对应值的内容，生成的json字符串中属性名不包含小括号里的内容。
    输出的字符串中，所以纯字符串进行输出，不包含markdowm语言，不包含反义字符等。确保您输出的内容能直接被js中JSON.parse函数直接解析为对象。
    如果某个字段无法从ocr识别结果中提取出来，请将对应字段写为0来代替
    ，ocr识别结果为：${ocrText}`;

    let resData = await deep(con);
    resData = resData!.match(/\{.*\}/s)![0]; // 使用正则匹配 {} 内的内容，s 让 . 匹配换行
    fs.writeFileSync(logDir, JSON.stringify(resData));

    let keepBadmintonObj: BadmintonData = JSON.parse(resData!);

    sql = `
    INSERT INTO keep_badminton 
    (dt_id, type, date, xiaohao, xinlv, xinlv_min, xinlv_max, time_m, time_all, fuzai, xunlanxiaoguo_you, xunlanxiaoguo_wu) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    const values = [
        dtid,
        '羽毛球',
        keepBadmintonObj.date,
        keepBadmintonObj.xiaohao,
        keepBadmintonObj.xinlv,
        keepBadmintonObj.xinlv_min,
        keepBadmintonObj.xinlv_max,
        keepBadmintonObj.time_m,
        keepBadmintonObj.time_all,
        keepBadmintonObj.fuzai,
        keepBadmintonObj.xunlanxiaoguo_you,
        keepBadmintonObj.xunlanxiaoguo_wu,
    ];
    dbSql(sql, values)
        .then(() => {
            console.log('ok');
        })
}

export async function keepRunOcr(dtid: string) {

    //查询是否存在
    let sql = `SELECT id FROM keep_run WHERE dt_id = ?`;
    let len = await dbSql<[]>(sql, [dtid]);

    if (Number(len.length) != 0) {
        console.log('已存在');
        return
    }
    let data = await ocrStart(Number(dtid), 1);
    let ocrText = JSON.stringify(data);
    //生成模板
    let typeData = `{
  "type":"跑步",
  "date(时间和日期)":"2025/03/04 19:00-19:30",
  "location(位置)":"开封",
  "juli(运动距离)":"2.12",
  "time_m(训练时长)":"06:24",
  "peishu(平均配速）":"06:04",
  "peishu_max(最快配速)":"03:20",
  "xiaohao(运动消耗，单位千卡)":"76",
  "time_all(总时长)":"08:18",
  "fuzai(运动负载)":"22",
  "xinlv(平均心率)":"160",
  "xinlv_max(最大心率)":"182",
  "xinlv_min(最小心率)":"109",
  "buping(平均步频)":"182",
  "gonlv(平均功耗)":"209",
  "bufu(平均步幅)":"1.21",
  "xunlanxiaoguo_you(训练效果，有氧)":"2.1",
  "xunlanxiaoguo_wu(训练效果，无氧)":"1.1",
  "cut(跑步能力评估)":"80"
}
`;

    let con = `我将我的运动记录截屏通过orc进行识别，因为大小限制，我将图片一份为二，然后对每张图片依次进行了识别
  ,识别结果中包含文字的内容和位置，然后根据这些帮我提取里面的主要信息，返回一个json字符串。返回内容只包含json字符串,直接输出json字符串，不包含换行等特殊字符，保证您输出的内容直接可以js中JSON.parse函数直接解析为对象。
  其实json字符串示例为${typeData},在这个输出中，属性名后面的小括号里的内容标注这个字段是记录什么内容的，请按照ocr识别结果中找到对应值的内容，生成的json字符串中属性名不包含小括号里的内容。
  输出的字符串中，所以纯字符串进行输出，不包含markdowm语言，不包含反义字符等。确保您输出的内容能直接被js中JSON.parse函数直接解析为对象。
  如果某个字段无法从ocr识别结果中提取出来，请将对应字段写为0来代替
  ，ocr识别结果为：${ocrText}`;

    let resData = await deep(con);
    fs.writeFileSync(logDir, JSON.stringify(resData));


    let keepRunObj: KeepRunRecord = { dtid: dtid, ...JSON.parse(resData!) }

    // 调用 dbSql 函数
    sql = `
INSERT INTO keep_run (
  dt_id, ocr_text, type, date, location, juli, time_m, peishu, peishu_max, 
  xiaohao, time_all, fuzai, xinlv, xinlv_max, xinlv_min, buping, gonlv, 
  bufu, xunlanxiaoguo_you, xunlanxiaoguo_wu, cut
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;
    const params = [
        dtid, // dtid
        ocrText, // ocr_text
        '跑步', // type
        keepRunObj.date, // date
        keepRunObj.location, // location
        keepRunObj.juli, // juli
        keepRunObj.time_m, // time_m
        keepRunObj.peishu, // peishu
        keepRunObj.peishu_max, // peishu_max
        keepRunObj.xiaohao, // xiaohao
        keepRunObj.time_all, // time_all
        keepRunObj.fuzai, // fuzai
        keepRunObj.xinlv, // xinlv
        keepRunObj.xinlv_max, // xinlv_max
        keepRunObj.xinlv_min, // xinlv_min
        keepRunObj.buping, // buping
        keepRunObj.gonlv, // gonlv
        keepRunObj.bufu, // bufu
        keepRunObj.xunlanxiaoguo_you, // xunlanxiaoguo_you
        keepRunObj.xunlanxiaoguo_wu, // xunlanxiaoguo_wu
        keepRunObj.cut // cut
    ];


    dbSql(sql, params)
        .then(() => {
            console.log("ok");
        })

}


//
export async function ocrStart(dtid: number, index: number) {

    let imgSrc = (await dbSql<{ img_src: string, img_name: string }[]>(`SELECT img_src,img_name FROM dt_img WHERE dt_id = ${dtid} AND img_index = ${index};`))[0];

    if (!imgSrc) {
        let filePath = path.join(getUrl('root', 'assets'), './dtimg/imgError.png');
        return
    }

    //资源路径
    let urls = path.join(getUrl('root', 'assets'));
    //文件名
    let filename = imgSrc.img_name;
    //文件路径
    let fileurl = path.join(urls, imgSrc.img_src);

    //文件全名
    let filePath = path.join(fileurl, filename);

    try {
        const ocrResults = await splitAndOCR(filePath);
        return ocrResults
    } catch (err) {
        console.error('处理流程失败:', err);
        return null;
    }
}

//处理图片数据
async function splitAndOCR(filePath: string) {
    try {
        // 获取图片元数据
        const metadata = await sharp(filePath).metadata();
        // 直接处理无需分割的情况
        if (metadata.height! <= 3200) {
            const buffer = await sharp(filePath).toBuffer();
            const base64 = `${buffer.toString('base64')}`;
            return { full: await baiduOcr(base64) };
        }

        // 并行处理图片分割和编码
        const [part1Buffer, part2Buffer] = await Promise.all([
            // 上半部分 (0-3200px)
            sharp(filePath)
                .extract({ left: 0, top: 0, width: metadata.width!, height: 3200 })
                .toBuffer(),
            // 下半部分 (3200px-剩余)
            sharp(filePath)
                .extract({
                    left: 0,
                    top: 3200,
                    width: metadata.width!,
                    height: metadata.height! - 3200
                })
                .toBuffer()
        ]);

        // 转换为Base64并添加MIME类型前缀
        const createBase64 = (buffer: Buffer) =>
            `data:image/png;base64,${buffer.toString('base64')}`;

        // 并行执行OCR识别
        //   const [result1, result2] = await Promise.all([
        //     baiduOcr(createBase64(part1Buffer)),
        //     baiduOcr(createBase64(part2Buffer))
        //   ]);
        let result1 = await baiduOcr(createBase64(part1Buffer));
        let result2 = await baiduOcr(createBase64(part2Buffer));
        return {
            part1: result1,
            part2: result2,
            // 可选：返回合并后的完整文本
            combined: [result1, result2].join('\n')
        };
    } catch (err) {
        console.error('图片处理失败:', err);
        throw err;
    }
}