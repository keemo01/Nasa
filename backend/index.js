require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();


app.use(cors());

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

// API Route for APOD
app.get('/api/apod', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { date } = req.query;
        let apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;
        if (date) {
            apiUrl += `&date=${date}`;
        }

        console.log(`Fetching APOD from NASA: ${apiUrl}`);
        const { data } = await axios.get(apiUrl);
        res.json(data);
    } catch (err) {
        console.error('Error fetching APOD from NASA:', err.message);
        if (err.response) {
            console.error('NASA API response error:', err.response.status, err.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch APOD from NASA API.' });
    }
});

// API Route for Mars Rover Photos
app.get('/api/mars-rover-photos', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { rover, sol, camera } = req.query;
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

// API Route for Asteroid Feed (Near Earth Objects by date range)
app.get('/api/asteroids/feed', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { start_date, end_date } = req.query;
        if (!start_date) {
            return res.status(400).json({ error: 'Missing required parameter: start_date is required.' });
        }

        let apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&api_key=${nasaApiKey}`;
        if (end_date) {
            apiUrl += `&end_date=${end_date}`;
        }

        console.log('Fetching asteroid feed from NASA:', apiUrl);
        const { data } = await axios.get(apiUrl);
        res.json(data);
    } catch (err) {
        console.error('Error fetching asteroid feed from NASA:', err.message);
        if (err.response) {
            console.error('NASA API response error:', err.response.status, err.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch asteroid feed from NASA API.' });
    }
});

// API Route for Specific Asteroid Lookup
app.get('/api/asteroids/lookup/:asteroid_id', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { asteroid_id } = req.params;
        if (!asteroid_id) {
            return res.status(400).json({ error: 'Missing required parameter: asteroid_id is required.' });
        }

        const apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/${asteroid_id}?api_key=${nasaApiKey}`;

        console.log('Looking up specific asteroid from NASA:', apiUrl);
        const { data } = await axios.get(apiUrl);
        res.json(data);
    } catch (err) {
        console.error('Error looking up asteroid from NASA:', err.message);
        if (err.response) {
            console.error('NASA API response error:', err.response.status, err.response.data);
            if (err.response.status === 404) {
                return res.status(404).json({ error: 'Asteroid not found with the provided ID.' });
            }
        }
        res.status(500).json({ error: 'Failed to lookup asteroid from NASA API.' });
    }
});

// API Route for Browsing Asteroid Database
app.get('/api/asteroids/browse', async (req, res) => {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        if (!nasaApiKey) {
            return res.status(500).json({ error: 'Server config error: NASA API key missing.' });
        }

        const { page, size } = req.query;
        let apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${nasaApiKey}`;

        if (page) {
            apiUrl += `&page=${page}`;
        }
        if (size) {
            apiUrl += `&size=${size}`;
        }

        console.log('Browsing asteroid database from NASA:', apiUrl);
        const { data } = await axios.get(apiUrl);
        res.json(data);
    } catch (err) {
        console.error('Error browsing asteroid database from NASA:', err.message);
        if (err.response) {
            console.error('NASA API response error:', err.response.status, err.response.data);
        }
        res.status(500).json({ error: 'Failed to browse asteroid database from NASA API.' });
    }
});

// Health Check Route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/apod',
            '/api/mars-rover-photos',
            '/api/asteroids/feed',
            '/api/asteroids/lookup/:asteroid_id',
            '/api/asteroids/browse'
        ]
    });
});

console.log('🚀 NASA API Backend initialized with the following endpoints:');
console.log('📸 APOD: /api/apod');
console.log('🔴 Mars Rover Photos: /api/mars-rover-photos');
console.log('🌌 Asteroid Feed: /api/asteroids/feed');
console.log('🎯 Asteroid Lookup: /api/asteroids/lookup/:asteroid_id');
console.log('📋 Asteroid Browse: /api/asteroids/browse');
console.log('💚 Health Check: /health');
