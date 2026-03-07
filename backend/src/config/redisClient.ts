import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async (): Promise<RedisClientType> => {
    if (redisClient.isOpen) {
        return redisClient;
    }
    await redisClient.connect();
    return redisClient;
};

export default redisClient;