
require('dotenv').config(); 

const express = require('express'); // Helps build our web server.
const axios = require('axios');  // For making HTTP requests 
const cors = require('cors'); // Prevents browser security errors 

const app = express(); // Create Express server instance

app.use(cors({
  origin: 'http://localhost:3000' 
}));

const PORT = process.env.PORT || 5001;

// Start the server and make it listen for requests
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log('Server is actively listening for requests.'); 
}).on('error', (err) => {
    // If the port is already in use or another error occurs on startup, log it and exit
    console.error('Failed to start server:', err.message);
    process.exit(1); 
});

// --- Server Error Handling ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); 
});

// --- API Route for APOD ---
// Defines the endpoint '/api/apod' that our frontend will call
app.get('/api/apod', async (req, res) => {
  try {
    const nasaApiKey = process.env.NASA_KEY;

    // Check if the API key is actually set
    if (!nasaApiKey) {
      console.error('NASA_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
    }

    // Make the request to NASA's APOD API
    const { data } = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`
    );
    
    // Send NASA's data back to our frontend
    res.json(data);
  } catch (err) {
    // Handle errors if fetching from NASA fails.
    console.error('Error fetching APOD from NASA:', err.message);
    if (err.response) {
      console.error('NASA API response error:', err.response.status, err.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch APOD from NASA API.' });
  }
});