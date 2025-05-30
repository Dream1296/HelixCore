import { PrismaClient } from '@prisma/client';

declare global {
  // 防止开发环境下多次new PrismaClient报错
  // 因为 globalThis 可以在多次热重载中保留同一个实例
  // 这段声明是告诉TS全局变量类型
  // 避免 "Cannot redeclare block-scoped variable" 错误
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: [ 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
