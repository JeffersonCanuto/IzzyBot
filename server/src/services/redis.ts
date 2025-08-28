import logger from 'jet-logger';

import { createClient } from 'redis';

import ENV from '@src/configs/ENV';

const redisClient = createClient({
    url: ENV.RedisUrl ?? 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
    logger.info('Redis client successfully started');
})();

export default redisClient;