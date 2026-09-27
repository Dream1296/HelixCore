import { logger } from '@/utils/logger';
import Redis from 'ioredis';

// 配置 Redis 连接选项
export let redisDB: Redis | null = null;

export function initRedisDB() {
    redisDB = new Redis({
        host: '127.0.0.1', // Redis 主机地址
        port: 6379,        // Redis 端口
        password: '',      // 如果设置了密码，填入密码
        db: 0,             // 使用的数据库编号（默认 0）

        // 禁止 ioredis 无限重连
        maxRetriesPerRequest: 1,

        retryStrategy(times) {
            if (times > 1) {
                return null; // 停止重连
            }

            return 1000; // 1 秒后重试
        },

        lazyConnect: true,

    });


    // 事件监听，确保 Redis 连接正常
    redisDB.on('connect', () => {
        logger.log('redis连接成功');
    });

    redisDB.on('error', (err) => {
        logger.log('redis连接失败', err);
    });
}






