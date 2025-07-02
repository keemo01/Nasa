import React from 'react';
import './Apod.css';

const Apod = ({ apodData, loading, error }) => {
    if (loading) {
        return (
            <div className="apod-card-panel apod-loading">
                <p>Fetching celestial insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="apod-card-panel apod-error">
                <p>Failed to load APOD.</p>
                <p>Error: {error.message || 'Unknown error'}</p>
            </div>
        );
    }

    if (!apodData) {
        return (
            <div className="apod-card-panel apod-no-data">
                <p>No APOD data available.</p>
            </div>
        );
    }

    return (
        <div className="apod-card-panel">
            <h3>Astronomy Picture of the Day</h3>
            <div className="apod-content">
                <div className="apod-image-container">
                    <img
                        src={apodData.url}
                        alt={apodData.title}
                        className="apod-image" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/333333/FFFFFF?text=Image+Not+Available"; }}
                    />
                </div>
                <h4>{apodData.title}</h4>
                <p className="custom-scrollbar">{apodData.explanation}</p>
            </div>
        </div>
    );
};

export default Apod;
