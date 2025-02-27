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
    id: string;
    user: string;
    name: string;
    touxian: string;
    text: string;
    textArr?: { type: string, text: string }[],
    imgShowAll: number;
    imgAllNum: number;
    videoNum: number;
    date: string;
    idea: string;
    po: number;
    com?: Comtent[];
    longVideo?: { id: number, name: string, src: string }[];
    keyword?: { keyword: string, isAi: number }[];
    File?:{name:string};
    bgStyle:number;
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
    date: string,
    content: string,
    dtId: string,
    commentsUser: string,
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



