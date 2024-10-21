import { getUser } from "../services/token";

function srtToken(req:{router:string,data:any,user?:any,token?:string}){
    if(!req.token){
        return;
    }
    
    req.user = getUser(req.token);
    
}

export {srtToken}