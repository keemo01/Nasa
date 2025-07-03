import axios from 'axios';

export default async function handler(request, response) {
    try {
        const nasaApiKey = process.env.NASA_KEY;
        const { rover, sol, camera } = request.query;
        if (!rover || !sol) return response.status(400).json({ error: 'Rover and sol are required.' });

        let apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${nasaApiKey}`;
        if (camera) apiUrl += `&camera=${camera}`;

        const { data } = await axios.get(apiUrl);
        response.status(200).json(data);
    } catch (err) {
        response.status(500).json({ error: 'Failed to fetch Mars Rover photos.' });
    }
}
