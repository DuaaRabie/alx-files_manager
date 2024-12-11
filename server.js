require('dotenv').config();
const express = require('express');
const app = express();

// Load routes from routes/index.js
app.use('/', require('./routes/index'));

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
