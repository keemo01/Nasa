import axios from 'axios';

export default async function handler(request, response) {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        const { start_date, end_date } = request.query;
        if (!start_date) return response.status(400).json({ error: 'start_date is required.' });

        let apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&api_key=${nasaApiKey}`;
        if (end_date) apiUrl += `&end_date=${end_date}`;

        const { data } = await axios.get(apiUrl);
        response.status(200).json(data);
    } catch (err) {
        response.status(500).json({ error: 'Failed to fetch asteroid feed.' });
    }
}