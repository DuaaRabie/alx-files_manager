import crypto from 'crypto'; // To hash the password
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db'; // Assuming dbClient is set up properly for MongoDB
import redisClient from '../utils/redis';

class UsersController {
  // POST /users to create a new user
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists in the DB
      const existingUser = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password with SHA1
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Create the new user
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the DB
      const result = await dbClient.client.db(dbClient.database).collection('users').insertOne(newUser);

      // Respond with the new user, excluding the password
      return res.status(201).json({
        id: result.insertedId,
        email: result.ops[0].email,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /users/me - Get current user based on token
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user ID from Redis
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Fetch user data from DB
    const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Return user info (only email and id)
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
