import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db'; // MongoDB client

const postUpload = async (req, res) => {
  const {
    name, type, parentId = 0, isPublic = false, data,
  } = req.body;
  const token = req.headers['x-token']; // Extract token from the header

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Authenticate the user by token
    const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ token });

    // If no user is found, return Unauthorized error
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach the userId to the request object
    const userId = user._id;

    // Validate name
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    // Validate type
    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }

    // Validate data for file or image types
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId (if exists)
    if (parentId !== 0) {
      const parent = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Handle folder type
    if (type === 'folder') {
      const newFolder = {
        name,
        type,
        userId,
        parentId,
        isPublic,
      };

      const folder = await dbClient.client.db(dbClient.database).collection('files').insertOne(newFolder);
      return res.status(201).json({
        id: folder.insertedId,
        userId,
        name,
        type,
        parentId,
        isPublic,
      });
    }

    // Handle file and image types
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4(); // Generate unique filename
    const filePath = path.join(folderPath, fileName);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write file data to disk
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    // Save file info in MongoDB
    const fileDocument = {
      name,
      type,
      userId,
      parentId,
      isPublic,
      localPath: filePath,
    };

    const file = await dbClient.client.db(dbClient.database).collection('files').insertOne(fileDocument);

    return res.status(201).json({
      id: file.insertedId,
      userId,
      name,
      type,
      parentId,
      isPublic,
      localPath: filePath,
    });
  } catch (err) {
    console.error('Error during file upload:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { postUpload };
