import { createClient } from '@redis/client';

class RedisClient {
  constructor() {
    this.client = createClient()

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  isAlive() {
    try {
      return this.client.ping().then(() => true).catch(() => false);
    } catch (error) {
      console.error('Error checking Redis connection:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error('Error fetching value from Redis:', error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
