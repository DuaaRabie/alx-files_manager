import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // Get the MongoDB connection details from environment variables
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct the connection string
    const url = `mongodb://${host}:${port}${database}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.database = database;
    this.client.connect();
  }

  // Function to check if the MongoDB connection is alive
  isAlive() {
    if (this.client.isConnected()) {
      return true
    }
    return false;
  }

  // Function to count the number of users in the 'users' collection
  async nbUsers() {
    try {
      const usersCollection = this.client.db(this.database).collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error fetching number of users:', error);
      return 0; // Return 0 if there's an error
    }
  }

  // Function to count the number of files in the 'files' collection
  async nbFiles() {
    try {
      const filesCollection = this.client.db(this.database).collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error fetching number of files:', error);
      return 0; // Return 0 if there's an error
    }
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
