import redisClient from '../utils/redis'; // Import Redis client
import dbClient from '../utils/db'; // Import MongoDB client

class AppController {
  // GET /status: Check if Redis and DB are alive
  static async getStatus(req, res) {
    try {
      // Check the status of Redis and MongoDB
      const redisStatus = await redisClient.isAlive();
      const dbStatus = await dbClient.isAlive();

      // Send the status response
      res.status(200).json({
        redis: redisStatus,
        db: dbStatus,
      });
    } catch (error) {
      console.error('Error in getStatus:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // GET /stats: Return number of users and files in DB
  static async getStats(req, res) {
    try {
      // Get the number of users and files from the database
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      // Send the stats response
      res.status(200).json({
        users: usersCount,
        files: filesCount,
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default AppController;
