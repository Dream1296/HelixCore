import { Request } from 'express'; 

interface  user {
    username:string,
}

export interface Reqs extends Request {  
    user?: user; // 注意这里的 ? 表示 user 属性是可选的  
}

// export interface List {
//     user: string;
//     name: string;
//     touxian: string;
//     text: string;
//     textArr?: { type: string, text: string }[],
//     img: string[];
//     video: string[];
//     date: string;
//     id: string;
//     idea: string;
//     com?: Comtent[];
//     keyword?: { keyword: string, isAi: number }[];
// }
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

export interface Lists {
    id: string;
    user: string;
    name: string;
    touxian: string;
    text: string;
    textArr?: { type: string, text: string }[],
    imgShowAll:number;
    imgAllNum:number;
    videoNum: number;
    date: string;
    idea: string;
    com?: Comtent[];
    keyword?: { keyword: string, isAi: number }[];
}

export interface Comtent {
    date: string,
    content: string,
    dtId: string,
    commentsUser: string,
    name: string,
}




