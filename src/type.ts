import { Request } from 'express';

type user = {
    username: string | 'guest',
    dtid:string,
    type: "ltk" | "rat",
}

export interface Reqs extends Request {
    user?: user; // 注意这里的 ? 表示 user 属性是可选的  
}

//旧的
export interface List {
    user: string;
    name: string;
    touxian: string;
    text: string;
    textArr?: { type: string, text: string }[],
    img: string;
    video: string;
    date: string;
    id: string;
    idea: string;
    com?: Comtent[];
    keyword?: { keyword: string, isAi: number }[];
}

//新的
export interface Lists {
    id: number;
    user: string;
    name: string;
    touxian: string;
    touxianUrl?:string;
    text: string;
    textArr?: { type: string, text: string }[],
    imgShowAll: number;
    imgAllNum: number;
    videoNum: number;
    imgUrl? :string;
    date: string;
    idea?: string;
    po: number;
    com?: Comtent[];
    longVideo?: { id: number, name: string, src: string }[];
    keyword?: { keyword: string, isAi: number }[];
    File?:{name:string,fileId:string};
    bgStyle:number;
    KeepRun?:KeepRunRecord;
    KeepBadminton?:BadmintonData;
    textTile:string;
    loa:number
}

export interface Listsc extends Lists{
    type:"A"
}

export interface dataImg {
    type: 'dataImg',
    id: string,
    name: string,
    touxian: string,
}

export type Mood = {
    type:"mood",
    id:string,
    touxian:string,
    name:string,
}

export type Top = {
    type:"top",
    id:string,
    touxian:string,
    name:string,
}

export interface Comtent {
    id:number,
    date: string,
    content: string,
    dtId: number,
    user: string,
    imgAllNum:number,
    name: string,
    loa:number,
}

//动态的文件
export interface dtFile {
    dt_id:number,
    name:string,
    file_src:string,
    loa:number
}

export interface TokenObj {
    user_id: string | "guest",
    dtid:string,
    date: number,
    type: "ltk" | "rat"
}

export interface KeepRunRecord {
    dt_id:string,
    type: string; // 运动类型
    date: string; // 时间和日期
    location: string; // 位置
    juli: string; // 运动距离
    time_m: string; // 训练时长
    peishu: string; // 平均配速
    peishu_max: string; // 最快配速
    xiaohao: string; // 运动消耗，单位千卡
    time_all: string; // 总时长
    fuzai: string; // 运动负载
    xinlv: string; // 平均心率
    xinlv_max: string; // 最大心率
    xinlv_min: string; // 最小心率
    buping: string; // 平均步频
    gonlv: string; // 平均功耗
    bufu: string; // 平均步幅
    xunlanxiaoguo_you: string; // 训练效果，有氧
    xunlanxiaoguo_wu: string; // 训练效果，无氧
    cut: string; // 跑步能力评估
    ocr_text?:string;
  }

  export type BadmintonData = {
    dt_id:number;
    id:number
    type: string; // 运动类型
    date: string; // 运动日期时间段
    xiaohao: number; // 运动消耗（单位：千卡）
    xinlv: number; // 平均心率
    xinlv_min: number; // 最小心率
    xinlv_max: number; // 最大心率
    time_m: string; // 训练时长（格式：MM:SS）
    time_all: string; // 总时长（格式：MM:SS）
    fuzai: number; // 运动负载
    xunlanxiaoguo_you: number; // 训练效果（有氧）
    xunlanxiaoguo_wu: number; // 训练效果（无氧）
};



