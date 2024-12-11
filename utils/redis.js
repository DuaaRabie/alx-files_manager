import Redis from 'ioredis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create a Redis client instance
    this.client = new Redis();

    // Error handling: log Redis client errors
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    // Promisify Redis methods (if necessary)
    // Promisifying the 'get', 'set', and 'del' methods for demonstration
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Method to check if Redis is alive
  isAlive() {
    return this.client.status === 'ready';
  }

  // Promisified method to get a value from Redis by key
  async get(key) {
    try {
      // Retrieve the value for the key
      return await this.getAsync(key);
    } catch (err) {
      console.error('Error getting key from Redis:', err);
      return null;
    }
  }

  // Promisified method to set a value in Redis with expiration time (in seconds)
  async set(key, value, durationInSeconds) {
    try {
      // Store the value in Redis with expiration time
      await this.setAsync(key, value, 'EX', durationInSeconds);
    } catch (err) {
      console.error('Error setting key in Redis:', err);
    }
  }

  // Promisified method to delete a key from Redis
  async del(key) {
    try {
      // Delete the value associated with the key
      await this.delAsync(key);
    } catch (err) {
      console.error('Error deleting key from Redis:', err);
    }
  }
}

// Create an instance of RedisClient and export it
const redisClient = new RedisClient();
module.export = redisClient;
