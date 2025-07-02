import React, { useState, useEffect, useCallback } from 'react';
import './RoverPage.css'; // Import its own CSS file

const RoverPage = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false); // Changed initial state to false
    const [error, setError] = useState(null);
    const [rover, setRover] = useState('curiosity'); // Default rover
    const [sol, setSol] = useState(1000); // Default Martian sol (day)
    const [camera, setCamera] = useState(''); // Optional camera filter
    const [debugInfo, setDebugInfo] = useState(''); // For debugging API calls
    const [displayedPhotos, setDisplayedPhotos] = useState([]);
    const [photosToShow, setPhotosToShow] = useState(12); // Limit initial display
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been initiated

    // Available rovers and cameras for selection
    const rovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    const cameras = {
        curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
        opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM'],
        spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM'],
        perseverance: ['EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_RIGHT', 'MCZ_LEFT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT']
    };

    // Debounce utility function (moved inside component or can be a separate utility)
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

    const fetchMarsRoverPhotos = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDebugInfo('');
        setPhotosToShow(12); // Reset photos to show on new search
        
        try {
            // Frontend now ONLY calls your backend endpoint
            let backendUrl = `http://localhost:5001/api/mars-rover-photos?rover=${rover}&sol=${sol}`;
            if (camera) {
                backendUrl += `&camera=${camera}`;
            }
                        
            const response = await fetch(backendUrl);
            
            if (!response.ok) {
                // If backend returns an error, throw it
                const errorData = await response.json();
                throw new Error(`Backend error! Status: ${response.status} - ${errorData.error || response.statusText}`);
            }
            
            const data = await response.json();
            const limitedPhotos = (data.photos || []).slice(0, 50); // Limit to 50 photos to prevent rate limiting on image loads
            setPhotos(limitedPhotos);
            setDisplayedPhotos(limitedPhotos.slice(0, 12)); // Display initial 12
            
        } catch (err) {
            console.error("Error fetching Mars Rover photos:", err);
            setError(err);
            setDebugInfo(prev => prev + `\n❌ Failed to fetch from backend: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [rover, sol, camera]); // Dependencies for useEffect

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(() => {
            if (hasSearched) { // Only trigger debounced search if a search has already been initiated
                fetchMarsRoverPhotos();
            }
        }, 1000), // Wait 1 second after user stops typing/selecting
        [fetchMarsRoverPhotos, hasSearched]
    );

    // Effect to trigger debounced search when parameters change
    useEffect(() => {
        if (hasSearched) {
            debouncedSearch();
        }
    }, [rover, sol, camera, debouncedSearch, hasSearched]);

    // Handle manual search button click
    const handleSearch = () => {
        setHasSearched(true); // Mark that a search has been initiated
        fetchMarsRoverPhotos();
    };

    // Handle showing more photos
    const showMorePhotos = () => {
        const newCount = Math.min(photosToShow + 12, photos.length);
        setPhotosToShow(newCount);
        setDisplayedPhotos(photos.slice(0, newCount));
    };

    // Update displayed photos when photosToShow changes (if photos array already populated)
    useEffect(() => {
        if (photos.length > 0 && displayedPhotos.length < photosToShow) {
            setDisplayedPhotos(photos.slice(0, photosToShow));
        }
    }, [photos, photosToShow, displayedPhotos.length]);


    return (
        <div className="mars-rover-page-container">
            <h2 className="page-title">
                Mars Rover Photo Gallery
            </h2>

            <div className="rover-controls-panel">
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
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="search-button"
                    >
                        {loading ? 'Searching...' : 'Search Photos'}
                    </button>
                </div>
            </div>

            {/* Rate Limiting Info */}
            <div className="rate-limiting-info">
                <strong>🚀 Rate Limiting Features:</strong>
                <ul>
                    <li>Manual search button prevents auto-requests</li>
                    <li>Limited to 50 photos max per request</li>
                    <li>Shows 12 photos initially with "Load More" option</li>
                    <li>1-second debounce on parameter changes (after initial search)</li>
                </ul>
            </div>

            {/* Debug Information */}
            {debugInfo && (
                <div className="debug-info-panel">
                    <strong>Debug Info:</strong><br />
                    {debugInfo}
                </div>
            )}

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
                                loading="lazy" // Lazy load images to prevent hitting rate limits
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

            {/* Load More Button */}
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
        </div>
    );
};

export default RoverPage;
