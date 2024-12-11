import redis from 'redis';
import { promisify } from 'util';


class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  isAlive() {
      return new Promise((resolve, reject) => {
        this.client.ping((error, res) => {
          if (error) {
            console.error('Error checking Redis connection:', error);
            return reject(false);
          }
          resolve(res === 'PONG');
      });
    });
  }

  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error('Error fetching value from Redis:', error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
