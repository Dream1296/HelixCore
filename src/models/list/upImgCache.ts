import { fastListDir, getFileHash } from "./list";



async function upImgCacheDir(dir: string) {
    let files = await fastListDir(dir);
    for(let file of files){
        let hash = getFileHash(file);
        


    }

}