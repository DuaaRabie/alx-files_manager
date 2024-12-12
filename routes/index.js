import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

// POST /users - Create a new user
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router;
