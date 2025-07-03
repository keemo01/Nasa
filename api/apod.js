import axios from 'axios';

export default async function handler(request, response) {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        const { date } = request.query;
        let apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;
        if (date) apiUrl += `&date=${date}`;

        const { data } = await axios.get(apiUrl);
        response.status(200).json(data);
    } catch (err) {
        response.status(500).json({ error: 'Failed to fetch APOD from NASA API.' });
    }
}