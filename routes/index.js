const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

// POST /users - Create a new user
router.post('/users', UsersController.postNew);

module.exports = router;
