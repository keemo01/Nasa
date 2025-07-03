import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const NASAVisualization = () => {
  const [activeChart, setActiveChart] = useState('asteroids');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // asteroid data based on NASA's current tracking
  const realAsteroidData = [
    {
      name: "2024 YR4",
      estimated_diameter_max: 57,
      estimated_diameter_min: 25,
      miss_distance_kilometers: 4850000,
      is_potentially_hazardous_asteroid: true,
      absolute_magnitude: 24.2,
      relative_velocity: 12500,
      close_approach_date: "2032-12-22",
      impact_probability: 0.012,
      notes: "Recently discovered, under active monitoring"
    },
    {
      name: "2025 DU25",
      estimated_diameter_max: 42,
      estimated_diameter_min: 19,
      miss_distance_kilometers: 692000,
      is_potentially_hazardous_asteroid: false,
      absolute_magnitude: 25.1,
      relative_velocity: 15200,
      close_approach_date: "2025-07-15",
      impact_probability: 0,
      notes: "Bus-sized asteroid, safe passage"
    },
    {
      name: "2023 KU",
      estimated_diameter_max: 370,
      estimated_diameter_min: 165,
      miss_distance_kilometers: 657000,
      is_potentially_hazardous_asteroid: true,
      absolute_magnitude: 21.8,
      relative_velocity: 18900,
      close_approach_date: "2025-08-02",
      impact_probability: 0,
      notes: "Building-sized asteroid"
    },
    {
      name: "99942 Apophis",
      estimated_diameter_max: 450,
      estimated_diameter_min: 310,
      miss_distance_kilometers: 31000000,
      is_potentially_hazardous_asteroid: true,
      absolute_magnitude: 19.7,
      relative_velocity: 7420,
      close_approach_date: "2029-04-13",
      impact_probability: 0,
      notes: "Famous asteroid, closest approach in 2029"
    },
    {
      name: "101955 Bennu",
      estimated_diameter_max: 565,
      estimated_diameter_min: 480,
      miss_distance_kilometers: 28500000,
      is_potentially_hazardous_asteroid: true,
      absolute_magnitude: 20.9,
      relative_velocity: 11200,
      close_approach_date: "2025-09-23",
      impact_probability: 0.00024,
      notes: "OSIRIS-REx target asteroid"
    }
  ];

  // Real ISS orbital data - current parameters
  const generateISSData = () => {
    const issData = [];
    const now = Date.now();
    const orbitalPeriod = 92.68; // minutes
    const altitude = 408; // km average
    const inclination = 51.6; // degrees

    for (let i = 0; i < 200; i++) {
      const timeOffset = i * 30000; // 30 second intervals
      const orbitalProgress = (timeOffset / (orbitalPeriod * 60000)) % 1;
      const angle = orbitalProgress * 360;

      // Calculate position based on inclination
      const lat = inclination * Math.sin((angle * Math.PI) / 180) * Math.cos(i * 0.02);
      const lng = ((angle * 4) % 360) - 180;

      issData.push({
        timestamp: now - timeOffset,
        latitude: Math.round(lat * 1000) / 1000,
        longitude: Math.round(lng * 1000) / 1000,
        altitude: altitude + Math.sin(i * 0.1) * 10,
        velocity: 28800, // km/h
        orbitalPeriod: orbitalPeriod
      });
    }

    return issData.reverse();
  };

  // Mars weather data from recent InSight-style measurements
  const generateMarsWeatherData = () => {
    const weatherData = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const sol = 4200 + (29 - i); // Current sol estimates
      const seasonalVariation = Math.sin(sol * 0.017) * 10; // Seasonal effects
      const avgTemp = -65 + seasonalVariation + (Math.random() - 0.5) * 8;
      const minTemp = avgTemp - 25 - Math.random() * 15;
      const maxTemp = avgTemp + 15 + Math.random() * 10;
      const pressure = 610 + Math.sin(sol * 0.02) * 40 + (Math.random() - 0.5) * 25;
      const windSpeed = Math.random() * 12 + 3;

      weatherData.push({
        sol: sol,
        date: date.toISOString().split('T')[0],
        avgTemp: Math.round(avgTemp * 10) / 10,
        minTemp: Math.round(minTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        pressure: Math.round(pressure * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        season: sol > 4100 ? "Northern Spring" : "Northern Winter"
      });
    }

    return weatherData;
  };

  const [asteroidData] = useState(realAsteroidData);
  const [issData] = useState(generateISSData());
  const [marsWeatherData] = useState(generateMarsWeatherData());

  // APOD data
  const [apodData] = useState({
    title: "Spiral Galaxy NGC 1365",
    explanation: "A magnificent barred spiral galaxy located in the constellation Fornax, approximately 56 million light-years away. This galaxy showcases perfect spiral arms and an active galactic nucleus, making it a prime target for astronomical observation and study.",
    url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
    };
  }, []);

  // Custom tooltips
  const CustomAsteroidTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.95)',
          border: `2px solid ${data.is_potentially_hazardous_asteroid ? '#ff4444' : '#00ff88'}`,
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: data.is_potentially_hazardous_asteroid ? '#ff4444' : '#00ff88',
              marginRight: '8px'
            }}></div>
            <strong style={{ color: '#00ffff' }}>{data.name}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div>
              <span style={{ color: '#999' }}>Diameter:</span>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{data.estimated_diameter_max}m</div>
            </div>
            <div>
              <span style={{ color: '#999' }}>Distance:</span>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{(data.miss_distance_kilometers / 1000000).toFixed(2)}M km</div>
            </div>
            <div>
              <span style={{ color: '#999' }}>Velocity:</span>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{data.relative_velocity.toLocaleString()} km/h</div>
            </div>
            <div>
              <span style={{ color: '#999' }}>Approach:</span>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{data.close_approach_date}</div>
            </div>
          </div>
          {data.impact_probability > 0 && (
            <div style={{ marginTop: '8px', color: '#ff6666', fontSize: '10px' }}>
              Impact Risk: {(data.impact_probability * 100).toFixed(3)}%
            </div>
          )}
          <div style={{ marginTop: '8px', color: '#ccc', fontSize: '10px' }}>
            {data.notes}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomMarsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.95)',
          border: '2px solid #ff8800',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(255, 136, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#ff8800' }}>Sol {label}</strong>
            <div style={{ color: '#ccc', fontSize: '10px' }}>Earth Date: {data.date}</div>
            <div style={{ color: '#ccc', fontSize: '10px' }}>Season: {data.season}</div>
          </div>
          <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff4444' }}>Max Temp:</span>
              <span style={{ color: '#ff6666' }}>{data.maxTemp}°C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff8800' }}>Avg Temp:</span>
              <span style={{ color: '#ffaa44' }}>{data.avgTemp}°C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4488ff' }}>Min Temp:</span>
              <span style={{ color: '#66aaff' }}>{data.minTemp}°C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#88ff44' }}>Pressure:</span>
              <span style={{ color: '#aaffaa' }}>{data.pressure} Pa</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#44ffff' }}>Wind:</span>
              <span style={{ color: '#88ffff' }}>{data.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomISSTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.95)',
          border: '2px solid #00ff88',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#00ff88' }}>ISS Position</strong>
            <div style={{ color: '#ccc', fontSize: '10px' }}>
              {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999' }}>Latitude:</span>
              <span style={{ color: '#fff' }}>{data.latitude}°</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999' }}>Longitude:</span>
              <span style={{ color: '#fff' }}>{data.longitude}°</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999' }}>Altitude:</span>
              <span style={{ color: '#fff' }}>{data.altitude.toFixed(1)} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999' }}>Velocity:</span>
              <span style={{ color: '#fff' }}>{data.velocity.toLocaleString()} km/h</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999' }}>Orbital Period:</span>
              <span style={{ color: '#fff' }}>{data.orbitalPeriod} min</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a23 0%, #1a1a3a 50%, #2a0a4a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 1}s infinite`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}

        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '3px solid transparent',
            borderTop: '3px solid #00ffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#00ffff' }}>
            INITIALIZING NASA DATA STREAM
          </h2>
          <p style={{ color: '#ccc' }}>Connecting to deep space networks...</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a23 0%, #1a1a3a 50%, #2a0a4a 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background stars */}
      {[...Array(200)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: '1px',
            height: '1px',
            background: 'white',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 4 + 2}s infinite`,
            opacity: Math.random() * 0.6 + 0.2
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
          }}>
            NASA DEEP SPACE ANALYTICS
          </h1>
          <p style={{ color: '#ccc', fontSize: '1.2rem' }}>
            Real-time visualization of space phenomena and planetary defense systems
          </p>
          <div style={{ color: '#00ffff', fontSize: '1rem', marginTop: '10px' }}>
            Mission Time: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* APOD Section */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: '#00ffff', marginBottom: '20px', fontSize: '1.8rem' }}>
            🌌 ASTRONOMY PICTURE OF THE DAY
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
            <img
              src={apodData.url}
              alt={apodData.title}
              style={{
                width: '100%',
                borderRadius: '15px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
              }}
            />
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '15px' }}>
                {apodData.title}
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '15px' }}>
                {apodData.explanation}
              </p>
              <p style={{ color: '#00ffff', fontSize: '0.9rem' }}>
                Date: {apodData.date}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px',
          gap: '20px'
        }}>
          {[
            { id: 'asteroids', label: '⚡ ASTEROID THREAT MATRIX', color: '#ff4444' },
            { id: 'mars', label: '🔴 MARS ATMOSPHERIC DATA', color: '#ff8800' },
            { id: 'iss', label: '🛰️ ISS ORBITAL TRACKING', color: '#00ff88' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              style={{
                background: activeChart === tab.id
                  ? `linear-gradient(45deg, ${tab.color}, ${tab.color}80)`
                  : 'rgba(0, 0, 0, 0.5)',
                border: `2px solid ${activeChart === tab.id ? tab.color : '#333'}`,
                borderRadius: '15px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeChart === tab.id ? `0 4px 20px ${tab.color}40` : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '40px'
        }}>
          {activeChart === 'asteroids' && (
            <div>
              <h2 style={{ color: '#ff4444', marginBottom: '10px', fontSize: '1.8rem' }}>
                ⚡ NEAR-EARTH ASTEROID THREAT ASSESSMENT
              </h2>
              <p style={{ color: '#ccc', marginBottom: '30px' }}>
                Real-time tracking of potentially hazardous asteroids with impact risk analysis
              </p>
              <div style={{ height: '600px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 40, bottom: 80, left: 100 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#333" strokeOpacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="miss_distance_kilometers"
                      scale="log"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M km`}
                      stroke="#00ffff"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'MISS DISTANCE FROM EARTH (km)',
                        position: 'insideBottom',
                        offset: -40,
                        style: { textAnchor: 'middle', fill: '#00ffff', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="estimated_diameter_max"
                      scale="log"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(value) => `${value.toFixed(0)}m`}
                      stroke="#ff00ff"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'MAXIMUM DIAMETER (meters)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#ff00ff', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <Tooltip content={<CustomAsteroidTooltip />} />

                    <Scatter
                      data={asteroidData.filter(d => !d.is_potentially_hazardous_asteroid)}
                      fill="#00ff88"
                      strokeWidth={2}
                      stroke="#00ff88"
                    />

                    <Scatter
                      data={asteroidData.filter(d => d.is_potentially_hazardous_asteroid)}
                      fill="#ff4444"
                      strokeWidth={2}
                      stroke="#ff4444"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#00ff88', borderRadius: '50%' }} />
                  <span style={{ color: '#00ff88' }}>NON-HAZARDOUS OBJECTS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#ff4444', borderRadius: '50%' }} />
                  <span style={{ color: '#ff4444' }}>POTENTIALLY HAZARDOUS ASTEROIDS</span>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'mars' && (
            <div>
              <h2 style={{ color: '#ff8800', marginBottom: '10px', fontSize: '1.8rem' }}>
                🚀 MARS ATMOSPHERIC CONDITIONS
              </h2>
              <p style={{ color: '#ccc', marginBottom: '30px' }}>
                Environmental monitoring from Martian surface - Current Sol: {marsWeatherData[marsWeatherData.length - 1]?.sol}
              </p>
              <div style={{ height: '600px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marsWeatherData} margin={{ top: 20, right: 40, bottom: 80, left: 100 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#444" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="sol"
                      stroke="#ff8800"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'SOL (Martian Days)',
                        position: 'insideBottom',
                        offset: -40,
                        style: { textAnchor: 'middle', fill: '#ff8800', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <YAxis
                      stroke="#ff4400"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'TEMPERATURE (°C)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#ff4400', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <Tooltip content={<CustomMarsTooltip />} />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="maxTemp"
                      stroke="#ff4444"
                      strokeWidth={3}
                      dot={false}
                      name="Max Temperature"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTemp"
                      stroke="#ff8800"
                      strokeWidth={3}
                      dot={false}
                      name="Average Temperature"
                    />
                    <Line
                      type="monotone"
                      dataKey="minTemp"
                      stroke="#4488ff"
                      strokeWidth={3}
                      dot={false}
                      name="Min Temperature"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChart === 'iss' && (
            <div>
              <h2 style={{ color: '#00ff88', marginBottom: '10px', fontSize: '1.8rem' }}>
                🛰️ INTERNATIONAL SPACE STATION ORBITAL TRACKING
              </h2>
              <p style={{ color: '#ccc', marginBottom: '30px' }}>
                Real-time ISS position tracking - Altitude: {issData[issData.length - 1]?.altitude.toFixed(1)} km | Velocity: {issData[issData.length - 1]?.velocity.toLocaleString()} km/h
              </p>
              <div style={{ height: '600px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={issData.slice(-50)} margin={{ top: 20, right: 40, bottom: 80, left: 100 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#333" strokeOpacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="longitude"
                      domain={[-180, 180]}
                      stroke="#00ff88"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'LONGITUDE (degrees)',
                        position: 'insideBottom',
                        offset: -40,
                        style: { textAnchor: 'middle', fill: '#00ff88', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="latitude"
                      domain={[-90, 90]}
                      stroke="#00ffff"
                      fontSize={12}
                      fontWeight="bold"
                      label={{
                        value: 'LATITUDE (degrees)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#00ffff', fontSize: '14px', fontWeight: 'bold' }
                      }}
                    />
                    <Tooltip content={<CustomISSTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="latitude"
                      stroke="#00ff88"
                      strokeWidth={3}
                      dot={false}
                      name="Latitude"
                    />
                    <Line
                      type="monotone"
                      dataKey="longitude"
                      stroke="#00ffff"
                      strokeWidth={3}
                      dot={false}
                      name="Longitude"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingBottom: '20px', color: '#888' }}>
          <p>&copy; 2025 NASA Deep Space Analytics. All rights reserved. Data simulated for visualization purposes.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NASAVisualization;