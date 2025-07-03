import axios from 'axios';

export default async function handler(request, response) {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        const { asteroid_id } = request.query; // Vercel puts the dynamic part in the query

        const apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/${asteroid_id}?api_key=${nasaApiKey}`;

        const { data } = await axios.get(apiUrl);
        response.status(200).json(data);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return response.status(404).json({ error: 'Asteroid not found.' });
        }
        response.status(500).json({ error: 'Failed to lookup asteroid.' });
    }
}