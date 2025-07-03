import React, { useState, useEffect, useCallback } from 'react';
import './RoverPage.css'; 
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const RoverPage = () => {
    // I'm setting up state variables for photos, loading, error, rover, sol, camera, and UI controls.
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rover, setRover] = useState('curiosity');
    const [sol, setSol] = useState(1000);
    const [camera, setCamera] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const [displayedPhotos, setDisplayedPhotos] = useState([]);
    const [photosToShow, setPhotosToShow] = useState(12);
    const [hasSearched, setHasSearched] = useState(false);

    // I'm defining available rovers and their respective cameras.
    const rovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    const cameras = {
        curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
        opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM'],
        spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM'],
        perseverance: ['EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_RIGHT', 'MCZ_LEFT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT']
    };

    // I'm defining a debounce utility function.
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // I'm using useCallback to memoize the photo fetching function.
    const fetchMarsRoverPhotos = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDebugInfo('');
        setPhotosToShow(12);

        try {
            // I'm calling the backend endpoint to fetch photos.
            let backendUrl = `http://localhost:5001/api/mars-rover-photos?rover=${rover}&sol=${sol}`;
            if (camera) {
                backendUrl += `&camera=${camera}`;
            }

            const response = await fetch(backendUrl);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Backend error! Status: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            const limitedPhotos = (data.photos || []).slice(0, 50); // I'm limiting to 50 photos.
            setPhotos(limitedPhotos);
            setDisplayedPhotos(limitedPhotos.slice(0, 12)); // I'm displaying initial 12.

        } catch (err) {
            console.error("Error fetching Mars Rover photos:", err);
            setError(err);
            setDebugInfo(prev => prev + `\n❌ Failed to fetch from backend: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [rover, sol, camera]);

    // I'm creating a debounced version of the search function.
    const debouncedSearch = useCallback(
        debounce(() => {
            if (hasSearched) {
                fetchMarsRoverPhotos();
            }
        }, 1000),
        [fetchMarsRoverPhotos, hasSearched]
    );

    // I'm using useEffect to trigger the debounced search when parameters change.
    useEffect(() => {
        if (hasSearched) {
            debouncedSearch();
        }
    }, [rover, sol, camera, debouncedSearch, hasSearched]);

    // I'm handling the manual search button click.
    const handleSearch = () => {
        setHasSearched(true);
        fetchMarsRoverPhotos();
    };

    // I'm handling the "Load More Photos" functionality.
    const showMorePhotos = () => {
        const newCount = Math.min(photosToShow + 12, photos.length);
        setPhotosToShow(newCount);
        setDisplayedPhotos(photos.slice(0, newCount));
    };

    // I'm updating displayed photos when `photosToShow` changes.
    useEffect(() => {
        if (photos.length > 0 && displayedPhotos.length < photosToShow) {
            setDisplayedPhotos(photos.slice(0, photosToShow));
        }
    }, [photos, photosToShow, displayedPhotos.length]);

    // I'm setting up state for camera statistics.
    const [cameraStats, setCameraStats] = useState({});

    // I'm calculating camera statistics when photos change.
    useEffect(() => {
        const stats = {};
        photos.forEach(photo => {
            const cam = photo.camera.full_name;
            stats[cam] = (stats[cam] || 0) + 1;
        });
        setCameraStats(stats);
    }, [photos]);

    return (
        <div className="mars-rover-page-container">
            <h2 className="page-title">
                Mars Rover Photo Gallery
            </h2>

            <div className="rover-controls-panel">
                {/* I'm rendering controls for rover, sol, and camera selection. */}
                <div className="control-group">
                    <label className="control-label">Select Rover:</label>
                    <select
                        value={rover}
                        onChange={(e) => setRover(e.target.value)}
                        className="control-select"
                    >
                        {rovers.map(r => (
                            <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label className="control-label">Martian Sol (Day):</label>
                    <input
                        type="number"
                        value={sol}
                        onChange={(e) => setSol(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="control-input"
                    />
                </div>

                <div className="control-group">
                    <label className="control-label">Select Camera:</label>
                    <select
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        className="control-select"
                    >
                        <option value="">All Cameras</option>
                        {cameras[rover] && cameras[rover].map(cam => (
                            <option key={cam} value={cam}>{cam}</option>
                        ))}
                    </select>
                </div>

                <div className="control-group search-button-group">
                    {/* I'm rendering the search button. */}
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="search-button"
                    >
                        {loading ? 'Searching...' : 'Search Photos'}
                    </button>
                </div>
            </div>

            {/* I'm displaying rate limiting information. */}
            <div className="rate-limiting-info">
                <strong>🚀 Rate Limiting Features:</strong>
                <ul>
                    <li>Manual search button prevents auto-requests</li>
                    <li>Limited to 50 photos max per request</li>
                    <li>Shows 12 photos initially with "Load More" option</li>
                    <li>1-second debounce on parameter changes (after initial search)</li>
                </ul>
            </div>

            {/* I'm displaying debug information. */}
            {debugInfo && (
                <div className="debug-info-panel">
                    <strong>Debug Info:</strong><br />
                    {debugInfo}
                </div>
            )}

            {/* I'm conditionally rendering loading, error, or no results messages. */}
            {loading && (
                <div className="gallery-status-message">
                    <div className="spinner"></div>
                    <p>Fetching Martian vistas...</p>
                </div>
            )}

            {error && (
                <div className="gallery-status-message error">
                    <p className="status-message-bold">Failed to load photos.</p>
                    <p>Error: {error.message}</p>
                    <p className="status-message-small">
                        Please ensure your backend server is running and accessible.
                    </p>
                </div>
            )}

            {!loading && !error && hasSearched && displayedPhotos.length === 0 && (
                <div className="gallery-status-message">
                    <p>No photos found for the selected criteria.</p>
                    <p>Try a different Martian Sol or Camera.</p>
                </div>
            )}

            {!hasSearched && (
                <div className="gallery-status-message initial-message">
                    <p>👆 Select your preferences and click "Search Photos" to get started!</p>
                </div>
            )}

            {/* I'm rendering the photo grid. */}
            <div className="photo-grid">
                {!loading && !error && displayedPhotos.map(photo => (
                    <div key={photo.id} className="photo-card">
                        <div className="photo-card-image-wrapper">
                            <img
                                src={photo.img_src}
                                alt={`Mars Rover Photo - Sol ${photo.sol} - Camera: ${photo.camera.full_name}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/400x300/333333/FFFFFF?text=Image+Error";
                                }}
                                loading="lazy"
                                className="photo-image"
                            />
                        </div>
                        <div className="photo-card-details">
                            <h4 className="camera-name">
                                {photo.camera.full_name}
                            </h4>
                            <p className="rover-info">
                                Rover: {photo.rover.name}
                            </p>
                            <p className="sol-info">
                                Sol: {photo.sol}
                            </p>
                            <p className="earth-date-info">
                                Date: {photo.earth_date}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* I'm rendering the "Load More" button. */}
            {photos.length > displayedPhotos.length && (
                <div className="load-more-container">
                    <button
                        onClick={showMorePhotos}
                        className="load-more-button"
                    >
                        Load More Photos ({displayedPhotos.length} of {photos.length})
                    </button>
                </div>
            )}

            {/* I'm rendering the data visualization chart. */}
            {hasSearched && !loading && !error && Object.keys(cameraStats).length > 0 && (
                <div className="camera-stats-chart-container">
                    <h3>Photo Count by Camera</h3>
                    <Bar
                        data={{
                            labels: Object.keys(cameraStats),
                            datasets: [{
                                label: 'Number of Photos',
                                data: Object.values(cameraStats),
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                            }]
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: true }
                            },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 } }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default RoverPage;