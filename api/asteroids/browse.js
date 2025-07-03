import axios from 'axios';

export default async function handler(request, response) {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        const { page, size } = request.query;
        let apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${nasaApiKey}`;

        if (page) apiUrl += `&page=${page}`;
        if (size) apiUrl += `&size=${size}`;

        const { data } = await axios.get(apiUrl);
        response.status(200).json(data);
    } catch (err) {
        response.status(500).json({ error: 'Failed to browse asteroid database.' });
    }
}