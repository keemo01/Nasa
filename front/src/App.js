import React from 'react';
import useNasaApod from './hooks/useNasaApod';
import './styles/App.css'; // Corrected import path for the main App.css

// Components
import Header from './components/Header/Header'; // Correct path
import Footer from './components/Footer/Footer'; // Correct path
import Timeline from './components/Timeline/Timeline'; // Correct path based on screenshot
import Lunar from './components/Lunar/Lunar'; // Corrected path and component name
import Mission from './components/Mission/MissionLog'; // Corrected path and component name (assuming Mission.js)
import Facts from './components/Facts/Facts'; // Corrected path and component name
import Apod from './components/Apod/Apod'; // Corrected path and component name

const App = () => {
    // Fetch APOD data at the top-level
    const { apodData, loading: apodLoading, error: apodError } = useNasaApod();

    // Simulated user ID for demonstration
    const userId = "lunar-explorer-alpha-7";

    // App-level loading state (e.g., initial data fetch)
    if (apodLoading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
                <p>Initiating Lunar Watch Systems...</p>
            </div>
        );
    }

    // App-level error state
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

    // Main application structure
    return (
        <div className="app-container">
            <Header userId={userId} />

            <main className="main-content">
                <section className="left-panel">
                    {/* Lunar component now self-contains its title and overlay */}
                    <Lunar />
                </section>

                <aside className="right-panel">
                    <Apod apodData={apodData} loading={apodLoading} error={apodError} />
                    <Mission />
                    <Facts />
                </aside>
            </main>

            <Timeline />
            <Footer />
        </div>
    );
};

export default App;