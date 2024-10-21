import path from 'path';

// root开始地址


export function getUrl( root:'src' | 'root',   ...paths: string[] ){
    let url = '';
    if(root == 'src'){
        url = __dirname;
    }
    if(root == 'root'){
        url = path.join(__dirname , '../');
    }

    for(let a of paths){
        url = path.join(url , a);
    }
    return url;
}


