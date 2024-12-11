const crypto = require('crypto');
const dbClient = require('../utils/db'); // Assuming you have a dbClient instance to interact with MongoDB

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Create a new user
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Save the new user in the database
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Return the new user with the id and email
      res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
