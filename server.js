import express from 'express';
import routes from './routes/index.js'; // Import routes

const app = express();

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Use the routes
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
