import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import uuid from 'uuid';
import dbClient from '../utils/db'; // Import MongoDB client

class FilesController {
  // POST /files: Upload a new file
  static async postUpload(req, res) {
    const token = req.headers['x-token']; // Extract token from request header

    // If no token, return Unauthorized
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract file data from request body
    const {
      name, type, data, parentId = 0, isPublic = false,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check if the parentId is valid if it is not 0
    if (parentId !== 0) {
      const parentFile = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    try {
      // Authenticate the user using the token
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ token });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Handle folder type (no data required, just save in DB)
      if (type === 'folder') {
        const newFile = {
          userId: user._id,
          name,
          type,
          isPublic,
          parentId,
        };

        const result = await dbClient.client.db(dbClient.database).collection('files').insertOne(newFile);
        return res.status(201).json(result.ops[0]);
      }

      // Handle file/image types (with data to store)
      if (data) {
        // Decode the base64 data directly in the controller
        const decodedData = Buffer.from(data, 'base64'); // Base64 decoding logic here

        // Generate a unique filename using UUID
        const uniqueFileName = uuid.v4();
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager'; // Default to /tmp/files_manager
        const filePath = path.join(folderPath, uniqueFileName);

        // Ensure the directory exists
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        // Write the decoded data to disk
        fs.writeFileSync(filePath, decodedData);

        // Create the file document to be saved in the database
        const newFile = {
          userId: user._id,
          name,
          type,
          isPublic,
          parentId,
          localPath: filePath,
        };

        const result = await dbClient.client.db(dbClient.database).collection('files').insertOne(newFile);
        return res.status(201).json(result.ops[0]);
      }

      // If we reach here, something went wrong, so return an error
      return res.status(400).json({ error: 'Invalid request' });
    } catch (err) {
      console.error('Error in postUpload:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /files/:id: Retrieve a specific file by ID
  static async getShow(req, res) {
    const { id } = req.params; // File ID
    const token = req.headers['x-token']; // Extract token from request header

    // If no token, return Unauthorized
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Authenticate the user using the token
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ token });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the file by ID and make sure it belongs to the authenticated user
      const file = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: ObjectId(id), userId: user._id });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Return the file if found
      return res.status(200).json(file);
    } catch (err) {
      console.error('Error fetching file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /files: Retrieve all users' file documents for a specific parentId with pagination
  static async getIndex(req, res) {
    const token = req.headers['x-token']; // Extract token from request header
    const { parentId = 0, page = 0 } = req.query; // Default parentId = 0, page = 0

    // If no token, return Unauthorized
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Authenticate the user using the token
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ token });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Use aggregation to apply pagination and filter by parentId
      const files = await dbClient.client.db(dbClient.database).collection('files').aggregate([
        {
          $match: { userId: user._id, parentId: parentId === '0' ? 0 : ObjectId(parentId) },
        },
        {
          $skip: parseInt(page, 10) * 20,
        },
        {
          $limit: 20, // Limit the result to 20 files per page
        },
        {
          $project: {
            _id: 1, name: 1, type: 1, isPublic: 1, parentId: 1,
          }, // Only return relevant fields
        },
      ]).toArray();

      return res.status(200).json(files);
    } catch (err) {
      console.error('Error fetching files:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
