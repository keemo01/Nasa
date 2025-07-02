require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001'
}));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log('Server is actively listening for requests.');
}).on('error', (err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// --- API Route for APOD ---
app.get('/api/apod', async (req, res) => {
  try {
    const nasaApiKey = process.env.NASA_KEY;
    if (!nasaApiKey) {
      console.error('NASA_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
    }
    const { data } = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`
    );
    res.json(data);
  } catch (err) {
    console.error('Error fetching APOD from NASA:', err.message);
    if (err.response) {
      console.error('NASA API response error:', err.response.status, err.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch APOD from NASA API.' });
  }
});

// --- API Route for Mars Rover Photos ---
app.get('/api/mars-rover-photos', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            console.error('NASA_KEY is not set in environment variables.');
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { rover, sol, camera } = req.query; // Get parameters from frontend request

        if (!rover || !sol) {
            return res.status(400).json({ error: 'Missing required parameters: rover and sol are required.' });
        }

        let apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${nasaApiKey}`;
        if (camera) {
            apiUrl += `&camera=${camera}`;
        }

        const { data } = await axios.get(apiUrl);
        res.json(data);
    } catch (err) {
        console.error('Error fetching Mars Rover photos from NASA:', err.message);
        if (err.response) {
            console.error('NASA API response error:', err.response.status, err.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch Mars Rover photos from NASA API.' });
    }
});
