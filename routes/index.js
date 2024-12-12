import express from 'express';

const router = express.Router();
const UsersController = require('../controllers/UsersController');

// POST /users - Create a new user
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router;
