import { NextFunction, Request, Response } from 'express';

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log(err);
    

    return res.status(500).json({
        code: 500,
        error: 'INTERNAL_ERROR',
        message: '服务器内部错误',
        data: []
    });
}