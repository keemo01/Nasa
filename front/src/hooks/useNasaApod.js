import { useState, useEffect } from 'react';
import { fetchApod } from '../api/nasaApi';

const useNasaApod = () => {
    const [apodData, setApodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getApod = async () => {
            try {
                setLoading(true);
                const data = await fetchApod();
                setApodData(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        getApod();
    }, []);

    return { apodData, loading, error };
};

export default useNasaApod;