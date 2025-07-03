import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; 

export const fetchApod = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/apod`);
        return response.data;
    } catch (error) {
        console.error('Error fetching APOD from backend:', error);
        throw error;
    }
};