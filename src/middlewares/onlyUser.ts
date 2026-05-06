import express, { NextFunction, Request, Response } from 'express';
import { Reqs } from "@/type";

// 仅允许特定用户访问的中间件
export function onlyUser(allowUsers: string[]) {
    return (req: Reqs, res: Response, next: NextFunction) => {
        
        if (allowUsers.length == 0) {
            return next();
        }
        const user = req.user?.username || 'guest';
        if (allowUsers.includes(user)) {
            return next();
        }        
        //  return next();
        return res.status(403).json({ code: 403, message: '未授权的访问1' });
    }
}