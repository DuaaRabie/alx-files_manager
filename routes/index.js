const express = require('express');
const router = express.Router();

router.get('/status', require('../controllers/AppController').getStatus);
router.get('/stats', require('../controllers/AppController').getStats);

module.exports = router;
