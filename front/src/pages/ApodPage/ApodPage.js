// src/pages/ApodPage.js
import React from 'react';
import Apod from '../../components/Apod/Apod'; // Assuming Apod.js is the component name
import useNasaApod from '../../hooks/useNasaApod'; // APOD data fetch
import './ApodPage.css'; // New CSS file for this page

const ApodPage = () => {
    const { apodData, loading, error } = useNasaApod(); // Fetch data specific to this page

    if (loading) {
        return (
            <div className="apod-page-loading">
                <p>Loading Astronomy Picture of the Day...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="apod-page-error">
                <p>Error loading APOD: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="apod-page-container">
            <Apod apodData={apodData} loading={loading} error={error} />
        </div>
    );
};

export default ApodPage;