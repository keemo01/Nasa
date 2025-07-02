import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import useNasaApod from './hooks/useNasaApod';

// Global Styles
import './styles/App.css'; // Consolidated global and layout styles

// Components (Top-level layout elements)
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Timeline from './components/Timeline/Timeline'; // Keep if you want to display it on all pages, or move to a specific route

// Page Components
import HomePage from './pages/Home/HomePage';
import ApodPage from './pages/ApodPage/ApodPage';
import MoonPage from './pages/Moon/MoonPage';
import MarsRoverPhotosPage from './pages/Mars/RoverPage'

const App = () => {
    const { apodData, loading: apodLoading, error: apodError } = useNasaApod();
    const userId = "lunar-explorer-alpha-7";

    if (apodLoading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
                <p>Initiating Lunar Watch Systems...</p>
            </div>
        );
    }

    if (apodError) {
        return (
            <div className="app-error">
                <h1>Connection Lost</h1>
                <p>An error occurred while fetching data from NASA.</p>
                <p className="error-code">Error: {apodError.message}</p>
                <p className="error-footer">Please check your network connection or try again later.</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <Header userId={userId} />

                <div className="main-page-content-wrapper">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/apod" element={<ApodPage apodData={apodData} loading={apodLoading} error={apodError} />} />
                        <Route path="/moon" element={<MoonPage />} />
                        <Route path="/mars-rover-photos" element={<MarsRoverPhotosPage />} /> {/* NEW: Route for Mars Rover Photos */}
                    </Routes>
                </div>

                 <Timeline /> 
                <Footer />
            </div>
        </Router>
    );
};

export default App;
