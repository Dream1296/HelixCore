import path from 'path';

// root开始地址
let rootPath = '/dream/HelixCore';

export function getUrl(root: 'src' | 'root', ...paths: string[]) {
    let url = '';
    if (root == 'src') {
        url = path.join(rootPath, 'src');
    }
    if (root == 'root') {
        url = rootPath;
    }

    for (let a of paths) {
        url = path.join(url, a);
    }
    return url;
}


