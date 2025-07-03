import React, { useState, useEffect, useCallback } from 'react';
import './ApodPage.css';

// Apod component for displaying the APOD data
const Apod = ({ apodData, loading, error }) => {
    // I'm conditionally rendering loading, error, or no data messages.
    if (loading) {
        return (
            <div className="apod-display-loading flex justify-center items-center min-h-[200px] text-xl text-purple-400 text-center p-4 rounded-xl bg-slate-800 mt-8 shadow-lg">
                <p>Loading Astronomy Picture of the Day...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="apod-display-error flex flex-col justify-center items-center min-h-[200px] text-xl text-red-500 text-center p-4 rounded-xl bg-slate-800 mt-8 shadow-lg">
                <p>Error loading APOD: {error.message}</p>
                {error.status && <p>Status: {error.status}</p>}
                <p className="text-sm text-slate-400 mt-2">Please ensure your backend is running and accessible.</p>
                <p className="text-sm text-slate-400">Also, check the console for more details.</p>
            </div>
        );
    }

    if (!apodData) {
        return (
            <div className="apod-display-no-data flex justify-center items-center min-h-[200px] text-xl text-slate-400 text-center p-4 rounded-xl bg-slate-800 mt-8 shadow-lg">
                <p>No APOD data available. Please select a date or check your connection.</p>
            </div>
        );
    }

    // I'm rendering the APOD content when data is available.
    return (
        <div className="apod-content-card bg-slate-800 rounded-xl p-8 shadow-2xl text-center max-w-4xl w-full mt-8 border border-slate-700">
            <h1 className="apod-content-title text-sky-400 text-4xl font-bold mb-4 leading-tight lg:text-3xl md:text-2xl">
                {apodData.title}
            </h1>
            <p className="apod-content-date text-slate-400 text-sm mb-6">
                {apodData.date}
            </p>

            {/* I'm conditionally rendering an image or an iframe based on media_type. */}
            {apodData.media_type === 'image' ? (
                <img
                    src={apodData.url}
                    alt={apodData.title}
                    className="apod-content-media apod-content-image w-full h-auto max-h-[500px] rounded-lg mb-8 object-contain bg-slate-900 mx-auto"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x400/334155/e2e8f0?text=Image+Not+Available";
                        e.target.alt = "Image not available";
                    }}
                />
            ) : (
                <iframe
                    src={apodData.url}
                    title={apodData.title}
                    className="apod-content-media apod-content-video w-full aspect-video max-w-full rounded-lg mb-8 mx-auto bg-slate-900"
                    frameBorder="0"
                    allowFullScreen
                    onError={() => console.error("Error loading video iframe")}
                />
            )}

            <p className="apod-content-explanation text-slate-300 text-lg leading-relaxed text-left mb-6 lg:text-base md:text-sm">
                {apodData.explanation}
            </p>

            {apodData.copyright && (
                <p className="apod-content-copyright text-slate-500 text-xs text-right mt-4">
                    © {apodData.copyright}
                </p>
            )}
        </div>
    );
};

const ApodPage = () => {
    // I'm setting up state variables for APOD data, loading, and error.
    const [apodData, setApodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // I'm initializing the selected date to today's date.
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://nasa-dcn0.onrender.com';

    // I'm creating a helper to format dates.
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // I'm memoizing the fetchApod function.
    const fetchApod = useCallback(async (dateToFetch) => {
        setLoading(true);
        setError(null);
        setApodData(null);

        let finalDateToRequest = dateToFetch;

        // I'm handling initial date calculation for "today" in Eastern Time so it matches NASA's APOD data availability
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

            finalDateToRequest = formatDate(easternDate);
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

            // I'm handling fallback for initial load if today's APOD fails.
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

                const formattedYesterday = formatDate(yesterdayEastern);

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
                    setError(null);
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
    }, [BACKEND_BASE_URL]);

    // I'm fetching APOD data on component mount
    useEffect(() => {
        fetchApod(null);
    }, [fetchApod]);

    // I'm handling date input changes
    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate);
        fetchApod(newDate);
    };

    // I'm handling navigation to previous/next day
    const handleNavigation = (direction) => {
        const currentDate = new Date(selectedDate + 'T12:00:00');
        let newDate = new Date(currentDate);

        if (direction === 'prev') {
            newDate.setDate(currentDate.getDate() - 1);
        } else if (direction === 'next') {
            newDate.setDate(currentDate.getDate() + 1);
        }

        const formattedNewDate = formatDate(newDate);
        setSelectedDate(formattedNewDate);
        fetchApod(formattedNewDate);
    };

    // I'm handling quick action buttons
    const handleQuickAction = (action) => {
        let dateToSet;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (action === 'today') {
            dateToSet = today;
        } else if (action === 'yesterday') {
            dateToSet = yesterday;
        } else if (action === 'random') {
            const startDate = new Date('1995-06-16');
            const endDate = new Date();
            const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
            dateToSet = new Date(randomTime);
        }

        const formattedDate = formatDate(dateToSet);
        setSelectedDate(formattedDate);
        fetchApod(formattedDate);
    };

    // I'm setting the maximum date for the date picker to today
    const maxDate = new Date().toISOString().split('T')[0];

    return (
        <div className="apod-page-container min-h-screen p-8 max-w-4xl mx-auto bg-slate-900 text-slate-100 font-inter box-border">
            <h2 className="apod-page-title text-purple-400 text-5xl mb-8 text-center font-bold drop-shadow-lg lg:text-4xl md:text-3xl">
                Astronomy Picture of the Day
            </h2>

            <div className="date-picker-container flex flex-col items-center mb-10 gap-6 p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
                <div className="date-controls flex items-center gap-4 flex-wrap justify-center">
                    {/* I'm rendering navigation buttons. */}
                    <button
                        onClick={() => handleNavigation('prev')}
                        className="nav-button w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xl font-bold transition-all duration-200 shadow-md hover:from-purple-600 hover:to-purple-800 hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-500"
                        aria-label="Previous Day"
                    >
                        &lt;
                    </button>

                    <div className="date-input-wrapper flex flex-col items-center gap-2">
                        {/* I'm rendering the date input. */}
                        <label htmlFor="apod-date-picker" className="date-picker-label text-slate-300 text-base font-medium text-center">
                            Select Date:
                        </label>
                        <input
                            type="date"
                            id="apod-date-picker"
                            value={selectedDate}
                            onChange={handleDateChange}
                            max={maxDate}
                            className="date-picker-input p-3 rounded-lg bg-slate-700 text-slate-50 border border-slate-600 outline-none transition-all duration-200 text-base cursor-pointer w-48 box-border appearance-none focus:border-transparent focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    <button
                        onClick={() => handleNavigation('next')}
                        className="nav-button w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xl font-bold transition-all duration-200 shadow-md hover:from-purple-600 hover:to-purple-800 hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-500"
                        aria-label="Next Day"
                        disabled={selectedDate === maxDate}
                    >
                        &gt;
                    </button>
                </div>

                <div className="quick-actions flex gap-4 flex-wrap justify-center">
                    {/* I'm rendering quick action buttons. */}
                    <button
                        onClick={() => handleQuickAction('today')}
                        className="action-button px-5 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 text-white text-base font-semibold transition-all duration-200 shadow-md hover:from-cyan-700 hover:to-cyan-900 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0 min-w-[90px] md:px-4 md:py-1.5 md:text-sm"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => handleQuickAction('yesterday')}
                        className="action-button px-5 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 text-white text-base font-semibold transition-all duration-200 shadow-md hover:from-cyan-700 hover:to-cyan-900 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0 min-w-[90px] md:px-4 md:py-1.5 md:text-sm"
                    >
                        Yesterday
                    </button>
                    <button
                        onClick={() => handleQuickAction('random')}
                        className="action-button px-5 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 text-white text-base font-semibold transition-all duration-200 shadow-md hover:from-cyan-700 hover:to-cyan-900 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0 min-w-[90px] md:px-4 md:py-1.5 md:text-sm"
                    >
                        Random
                    </button>
                </div>
            </div>

            {/* I'm rendering the Apod display component. */}
            <Apod apodData={apodData} loading={loading} error={error} />
        </div>
    );
};

export default ApodPage;
