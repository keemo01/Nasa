import { useState, useEffect, useCallback } from 'react';

const useNasaApod = (initialDate = '') => {
    // I'm setting up state for APOD data, loading status, and any errors.
    const [apodData, setApodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // I'm memoizing the function to fetch APOD data.
    const fetchApod = useCallback(async (dateToFetch) => {
        setLoading(true);
        setError(null);
        try {
            // I'm constructing the API URL, adding a date parameter if provided.
            const dateParam = dateToFetch ? `?date=${dateToFetch}` : '';
            const response = await fetch(`http://localhost:5001/api/apod${dateParam}`);

            if (!response.ok) {
                // I'm handling potential errors from the backend.
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error from backend'}`);
            }
            const data = await response.json();
            setApodData(data);
        } catch (err) {
            console.error("Error fetching APOD:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []); // This function is created once because of the empty dependency array.

    // I'm using a useEffect hook to fetch APOD data when the component mounts or `initialDate` changes.
    useEffect(() => {
        // I'm determining the date to fetch: `initialDate` if provided, otherwise today's date.
        const date = initialDate || new Date().toISOString().split('T')[0];
        fetchApod(date);
    }, [initialDate, fetchApod]); // I'm re-running this effect if `initialDate` or `fetchApod` changes.

    // I'm providing a way for external components to trigger a fetch by date.
    const fetchApodByDate = (date) => {
        fetchApod(date);
    };

    // I'm returning the APOD data, loading status, error, and the fetch function.
    return { apodData, loading, error, fetchApodByDate };
};

export default useNasaApod;