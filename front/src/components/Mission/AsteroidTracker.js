import React, { useState, useCallback, useEffect } from 'react';
import './Mission.css'; 

const AsteroidTracker = () => {
    // I'm setting up state variables for asteroid data, loading, error, search parameters, and UI elements.
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchType, setSearchType] = useState('feed');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [asteroidId, setAsteroidId] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const [missionLog, setMissionLog] = useState([]);
    const [displayedAsteroids, setDisplayedAsteroids] = useState([]);
    const [asteroidsToShow, setAsteroidsToShow] = useState(10);

    // I'm adding a new entry to the mission log.
    const addMissionLogEntry = useCallback((entryText) => {
        if (entryText.trim()) {
            const newLog = {
                id: Date.now(),
                text: entryText,
                timestamp: Date.now(),
            };
            setMissionLog((prevLogs) => [newLog, ...prevLogs].slice(0, 50));
        }
    }, []);

    // I'm calculating the danger level of an asteroid.
    const calculateDangerLevel = (asteroid) => {
        const diameter = asteroid.estimated_diameter?.meters?.estimated_diameter_max || 0;
        const distance = parseFloat(asteroid.close_approach_data?.[0]?.miss_distance?.kilometers || Infinity);
        const isPotentiallyHazardous = asteroid.is_potentially_hazardous_asteroid;

        if (isPotentiallyHazardous || diameter > 1000 || distance < 1000000) {
            return { level: 'HIGH', colorClass: 'danger-high', emoji: '🔴' };
        } else if (diameter > 500 || distance < 5000000) {
            return { level: 'MEDIUM', colorClass: 'danger-medium', emoji: '🟡' };
        } else {
            return { level: 'LOW', colorClass: 'danger-low', emoji: '🟢' };
        }
    };

    // I'm formatting large numbers for display.
    const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return 'N/A';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    };

    // I'm filtering asteroids by date range for feed searches.
    const filterAsteroidsByDateRange = (asteroidList, startDate, endDate) => {
        if (searchType !== 'feed') return asteroidList;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return asteroidList.filter(asteroid => {
            if (!asteroid.close_approach_data || asteroid.close_approach_data.length === 0) {
                return false;
            }
            return asteroid.close_approach_data.some(approach => {
                const approachDate = new Date(approach.close_approach_date);
                return approachDate >= start && approachDate <= end;
            });
        });
    };

    // I'm defining the asynchronous function to search for asteroids.
    const searchAsteroids = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo('');
        setAsteroids([]);
        setDisplayedAsteroids([]);
        setAsteroidsToShow(10);

        try {
            let backendUrl = '';
            let searchDescription = '';

            switch (searchType) {
                case 'feed':
                    backendUrl = `http://localhost:5001/api/asteroids/feed?start_date=${startDate}&end_date=${endDate}`;
                    searchDescription = `Searching for asteroids approaching Earth between ${startDate} and ${endDate}`;
                    break;
                case 'lookup':
                    if (!asteroidId) {
                        throw new Error('Asteroid ID is required for lookup');
                    }
                    backendUrl = `http://localhost:5001/api/asteroids/lookup/${asteroidId}`;
                    searchDescription = `Looking up specific asteroid with ID: ${asteroidId}`;
                    break;
                case 'browse':
                    backendUrl = `http://localhost:5001/api/asteroids/browse`;
                    searchDescription = 'Browse general asteroid database';
                    break;
                default:
                    throw new Error('Invalid search type');
            }

            addMissionLogEntry(`🔍 ${searchDescription}`);

            const response = await fetch(backendUrl);
            if (!response.ok) {
                let errorMessage = `API error! Status: ${response.status} - ${response.statusText}`;
                const contentType = response.headers.get('Content-Type');

                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorBody = await response.json();
                        errorMessage = errorBody.error || errorBody.message || errorMessage;
                    } catch (jsonParseError) {
                        errorMessage = `${errorMessage}. Failed to parse error response as JSON: ${jsonParseError.message}`;
                    }
                } else {
                    const errorText = await response.text();
                    errorMessage = `${errorMessage}. Response: ${errorText.substring(0, 200)}...`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            let asteroidList = [];
            if (searchType === 'feed') {
                Object.values(data.near_earth_objects || {}).forEach(dateGroup => {
                    asteroidList.push(...dateGroup);
                });
                asteroidList = filterAsteroidsByDateRange(asteroidList, startDate, endDate);
                setDebugInfo(prev => prev + `\n✅ Found ${asteroidList.length} asteroids in date range ${startDate} to ${endDate}`);
                addMissionLogEntry(`✅ Located ${asteroidList.length} Near-Earth Objects in specified date range`);
            } else if (searchType === 'lookup') {
                asteroidList = [data];
                setDebugInfo(prev => prev + `\n✅ Successfully retrieved asteroid data`);
                addMissionLogEntry(`✅ Retrieved data for asteroid ${data.name || asteroidId}`);
            } else if (searchType === 'browse') {
                asteroidList = data.near_earth_objects || [];
                setDebugInfo(prev => prev + `\n✅ Browsed ${asteroidList.length} asteroids from database`);
                addMissionLogEntry(`✅ Browsed ${asteroidList.length} asteroids from database`);
            }

            setAsteroids(asteroidList);
            setDisplayedAsteroids(asteroidList.slice(0, asteroidsToShow));

            const dangerousAsteroids = asteroidList.filter(ast =>
                calculateDangerLevel(ast).level === 'HIGH'
            );
            if (dangerousAsteroids.length > 0) {
                addMissionLogEntry(`⚠️ ${dangerousAsteroids.length} HIGH-RISK asteroids detected!`);
            }

        } catch (err) {
            console.error("Error fetching asteroid data:", err);
            setError(err);
            setDebugInfo(prev => prev + `\n❌ Search failed: ${err.message}`);
            addMissionLogEntry(`❌ Mission failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // I'm handling the "Load More" functionality.
    const showMoreAsteroids = () => {
        setAsteroidsToShow(prevCount => prevCount + 10);
    };

    // I'm updating displayed asteroids when the main asteroid list or `asteroidsToShow` count changes.
    useEffect(() => {
        setDisplayedAsteroids(asteroids.slice(0, asteroidsToShow));
    }, [asteroids, asteroidsToShow]);

    // I'm performing an initial search when the component mounts.
    useEffect(() => {
        addMissionLogEntry('🛰️ Initializing Asteroid Tracker Mission...');
        searchAsteroids();
    }, []);

    return (
        <div className="asteroid-tracker-container">
            <h1 className="page-title">Asteroid Tracking Operations</h1>

            <div className="main-content-panels">
                {/* Mission Control Panel */}
                <div className="control-panel-wrapper">
                    <div className="mission-card-panel">
                        <h3>Mission Control</h3>
                        <div className="control-group">
                            <label className="control-label">Search Type:</label>
                            <div className="search-type-selection">
                                {/* I'm rendering radio buttons for search type selection. */}
                                <label>
                                    <input
                                        type="radio"
                                        value="feed"
                                        checked={searchType === 'feed'}
                                        onChange={() => setSearchType('feed')}
                                    />
                                    Near Earth Objects Feed
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="lookup"
                                        checked={searchType === 'lookup'}
                                        onChange={() => setSearchType('lookup')}
                                    />
                                    Lookup by ID
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="browse"
                                        checked={searchType === 'browse'}
                                        onChange={() => setSearchType('browse')}
                                    />
                                    Browse Database
                                </label>
                            </div>
                        </div>

                        {/* I'm conditionally rendering date inputs for 'feed' search. */}
                        {searchType === 'feed' && (
                            <div className="control-group date-input-group">
                                <div>
                                    <label className="control-label">Start Date:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="control-label">End Date:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="input-field"
                                        min={startDate}
                                    />
                                </div>
                            </div>
                        )}

                        {/* I'm conditionally rendering asteroid ID input for 'lookup' search. */}
                        {searchType === 'lookup' && (
                            <div className="control-group">
                                <label className="control-label">Asteroid ID:</label>
                                <input
                                    type="text"
                                    value={asteroidId}
                                    onChange={(e) => setAsteroidId(e.target.value)}
                                    placeholder="Enter asteroid ID (e.g., 2000433)"
                                    className="input-field"
                                />
                            </div>
                        )}

                        {/* I'm rendering the search button with loading spinner. */}
                        <button onClick={searchAsteroids} disabled={loading} className="submit-button">
                            {loading ? (
                                <div className="button-spinner-container">
                                    <div className="button-spinner"></div>
                                    Scanning...
                                </div>
                            ) : (
                                'Initiate Scan'
                            )}
                        </button>

                        {/* Mission Log section */}
                        <div className="mission-log-section">
                            <h4 className="log-title">Activity Log</h4>
                            <div className="log-list custom-scrollbar">
                                <div className="log-entries-container">
                                    {missionLog.length === 0 ? (
                                        <p className="empty-message">No mission logs yet.</p>
                                    ) : (
                                        missionLog.map((entry) => (
                                            <div key={entry.id} className="log-entry">
                                                <span className="timestamp">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                                                <span className="log-text">{entry.text}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="results-panel-wrapper">
                    {/* Debug Console display */}
                    <div className="debug-console-panel custom-scrollbar">
                        <strong>Debug Console:</strong>
                        <pre>{debugInfo || "Awaiting mission commands..."}</pre>
                    </div>

                    {/* I'm conditionally rendering error messages. */}
                    {error && (
                        <div className="status-message error">
                            <h3 className="status-message-bold">🚨 Error Detected!</h3>
                            <p>{error.message}</p>
                        </div>
                    )}

                    {/* I'm conditionally rendering loading messages. */}
                    {loading && (
                        <div className="status-message loading">
                            <div className="spinner"></div>
                            <p>Scanning for celestial bodies...</p>
                            <p>Please wait, this may take a moment.</p>
                        </div>
                    )}

                    {/* I'm conditionally rendering no results message. */}
                    {!loading && asteroids.length === 0 && !error && (
                        <div className="status-message no-results">
                            <span className="no-results-emoji">🌌</span>
                            <p>No asteroids found for the current criteria.</p>
                            <p className="no-results-subtext">Adjust parameters and try again, or browse the database.</p>
                        </div>
                    )}

                    {/* Asteroid Results display */}
                    {!loading && asteroids.length > 0 && (
                        <div className="asteroid-results-section mission-card-panel">
                            <h3 className="results-heading">
                                Detected Asteroids ({asteroids.length})
                            </h3>
                            <div className="asteroid-grid">
                                {displayedAsteroids.map((asteroid) => {
                                    const danger = calculateDangerLevel(asteroid);
                                    const missDistanceKm = parseFloat(asteroid.close_approach_data?.[0]?.miss_distance?.kilometers);
                                    const approachDate = asteroid.close_approach_data?.[0]?.close_approach_date;

                                    return (
                                        <div key={asteroid.id} className={`asteroid-card ${danger.colorClass}`}>
                                            <div className="asteroid-card-header">
                                                <h4 className="asteroid-name">{asteroid.name}</h4>
                                                <span className={`danger-tag ${danger.colorClass}`}>
                                                    {danger.emoji} {danger.level}
                                                </span>
                                            </div>
                                            <div className="asteroid-details-grid">
                                                <div>
                                                    <p className="detail-label">ID:</p>
                                                    <p className="detail-value">{asteroid.id}</p>
                                                </div>
                                                <div>
                                                    <p className="detail-label">Max Diameter:</p>
                                                    <p className="detail-value">{formatNumber(asteroid.estimated_diameter?.meters?.estimated_diameter_max)} meters</p>
                                                </div>
                                                {approachDate && (
                                                    <div>
                                                        <p className="detail-label">Approach Date:</p>
                                                        <p className="detail-value">{approachDate}</p>
                                                    </div>
                                                )}
                                                {missDistanceKm && (
                                                    <div>
                                                        <p className="detail-label">Miss Distance:</p>
                                                        <p className="detail-value">{formatNumber(missDistanceKm)} km</p>
                                                    </div>
                                                )}
                                            </div>
                                            {asteroid.is_potentially_hazardous_asteroid && (
                                                <div className="hazardous-warning">
                                                    <strong>Potential Hazard Detected!</strong>
                                                </div>
                                            )}
                                            {/* I'm linking to the asteroid's JPL page. */}
                                            <a
                                                href={asteroid.nasa_jpl_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="jpl-link submit-button"
                                                style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                            >
                                                More Info (JPL)
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* I'm rendering the "Show More" button if there are more asteroids to display. */}
                            {asteroids.length > displayedAsteroids.length && (
                                <div className="load-more-container">
                                    <button onClick={showMoreAsteroids} className="load-more-button">
                                        Show More Asteroids ({asteroids.length - displayedAsteroids.length} remaining)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsteroidTracker;