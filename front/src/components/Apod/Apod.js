import React, { useState, useEffect, useCallback } from 'react';
import Apod from './Apod'; 
import './Apod.css'; 

const BACKEND_BASE_URL = 'http://localhost:5001'; 

const ApodPage = () => {
    // I'm setting up state for APOD data, loading, and error.
    const [apodData, setApodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // I'm initializing the selected date to today's date in YYYY-MM-DD format.
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // I'm memoizing the fetchApod function to prevent unnecessary re-renders.
    const fetchApod = useCallback(async (dateToFetch) => {
        setLoading(true);
        setError(null);
        setApodData(null); // I'm clearing previous APOD data.

        let finalDateToRequest = dateToFetch;

        // I'm calculating today's date in NASA's Eastern Time if no date is provided.
        if (!dateToFetch) {
            const now = new Date();
            const easternTimeString = now.toLocaleString("en-US", {
                timeZone: "America/New_York",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
            const [monthStr, dayStr, yearStr] = easternTimeString.split('/');
            const easternDate = new Date(yearStr, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

            const formattedYear = easternDate.getFullYear();
            const formattedMonth = String(easternDate.getMonth() + 1).padStart(2, '0');
            const formattedDay = String(easternDate.getDate()).padStart(2, '0');
            finalDateToRequest = `${formattedYear}-${formattedMonth}-${formattedDay}`;
        }

        console.log(`Attempting to fetch APOD for date: ${finalDateToRequest}`);
        const apiUrl = `${BACKEND_BASE_URL}/api/apod?date=${finalDateToRequest}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.msg || JSON.stringify(errorBody)}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
                }
            }
            const data = await response.json();
            setApodData(data);
            console.log("APOD fetched successfully for date:", finalDateToRequest);
        } catch (err) {
            console.error(`Error fetching APOD for ${finalDateToRequest}:`, err);
            setError({
                message: `Failed to load APOD for ${finalDateToRequest}. ${err.message || 'Please try another date.'}`,
                status: err.status || 'Request Failed'
            });

            if (!dateToFetch && err.message.includes('No data available')) {
                 console.log("Initial fetch failed. Attempting fallback for today's APOD (yesterday's Eastern Time).");
                 const now = new Date();
                 const easternTimeString = now.toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                 });
                const [monthStr, dayStr, yearStr] = easternTimeString.split('/');
                const easternDate = new Date(yearStr, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

                const yesterdayEastern = new Date(easternDate);
                yesterdayEastern.setDate(yesterdayEastern.getDate() - 1);

                const yesterdayYear = yesterdayEastern.getFullYear();
                const yesterdayMonth = String(yesterdayEastern.getMonth() + 1).padStart(2, '0');
                const yesterdayDay = String(yesterdayEastern.getDate()).padStart(2, '0');
                const formattedYesterday = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

                const fallbackApiUrl = `${BACKEND_BASE_URL}/api/apod?date=${formattedYesterday}`;

                try {
                    const fallbackResponse = await fetch(fallbackApiUrl);
                    if (!fallbackResponse.ok) {
                        const contentType = fallbackResponse.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const errorBody = await fallbackResponse.json();
                            throw new Error(`Fallback HTTP error! Status: ${fallbackResponse.status}. Message: ${errorBody.msg || JSON.stringify(errorBody)}`);
                        } else {
                            const errorText = await fallbackResponse.text();
                            throw new Error(`Fallback HTTP error! Status: ${fallbackResponse.status}. Response: ${errorText.substring(0, 100)}...`);
                        }
                    }
                    const fallbackData = await fallbackResponse.json();
                    setApodData(fallbackData);
                    console.log("APOD fetched successfully for fallback date:", formattedYesterday);
                    setError(null); // I'm clearing the error if fallback succeeds.
                } catch (fallbackErr) {
                    console.error("Final fallback APOD fetch failed:", fallbackErr);
                    setError({
                        message: `Failed to load any APOD. ${fallbackErr.message || 'Please try again later.'}`,
                        status: fallbackErr.status || 'Request Failed'
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    }, []); // I'm ensuring fetchApod is stable across renders.

    // I'm fetching APOD data when the component mounts.
    useEffect(() => {
        fetchApod(null);
    }, [fetchApod]);

    // I'm handling changes from the date input.
    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate); // I'm updating the state with the new selected date.
        fetchApod(newDate); // I'm fetching APOD for the newly selected date.
    };

    return (
        <div className="apod-page-container">
            <h2 className="apod-page-title">Astronomy Picture of the Day</h2>

            <div className="date-picker-container">
                <label htmlFor="apod-date-picker" className="date-picker-label">Select Date:</label>
                <input
                    type="date"
                    id="apod-date-picker"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]} // I'm preventing future dates.
                    className="date-picker-input"
                />
            </div>

            {/* I'm displaying the Apod display component, passing data and status. */}
            <Apod apodData={apodData} loading={loading} error={error} />
        </div>
    );
};

export default ApodPage;