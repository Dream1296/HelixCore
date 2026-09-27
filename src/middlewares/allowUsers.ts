import express, { NextFunction, Request, Response } from 'express';
import { Reqs } from "@/type";
import { logger } from '@/utils/logger';

export function allowUsers(...users: string[]) {
    return (req: Reqs, res: Response, next: NextFunction) => {
        const username = req.user?.username as string ?? 'guest';

        if (users.includes(username)) {
            return next();
        }
        logger.log('-------------------------------------');
        logger.log(`访问接口: ${req.originalUrl}`);
        logger.log('访问受保护的接口,被allowUsers中间件拦截');
        logger.log(`被拦截的用户: ${username}}`);
        logger.log(`允许的用户列表: ${users.join(', ')}`);
        logger.log('-------------------------------------');
        
        return res.status(403).json({
            code: 403,
            message: '无权限'
        });
    };
}