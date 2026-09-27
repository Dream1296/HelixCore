import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to initialize Prisma');
}

const adapter = new PrismaMariaDb(databaseUrl);

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
    adapter,
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
