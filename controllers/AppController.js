// controllers/AppController.js
const RedisClient = require('../utils/RedisClient');
const DBClient = require('../utils/db');

class AppController {
    getStatus(req, res) {
        Promise.all([
            RedisClient.isAlive(),
            DBClient.isAlive()
        ])
        .then(([redisAlive, dbAlive]) => {
            res.status(200).json({ 
                "redis": redisAlive,
                "db": dbAlive 
            });
        })
        .catch(error => {
            console.error('Error checking status:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }

    getStats(req, res) {
        Promise.all([
            DBClient.nbUsers(),
            DBClient.nbFiles()
        ])
        .then(([users, files]) => {
            res.status(200).json({
                "users": users,
                "files": files
            });
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }
}

module.exports = new AppController();
