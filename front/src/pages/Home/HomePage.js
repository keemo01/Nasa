import React from 'react';
import { Rocket, Camera, Globe, Target, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import './HomePage.css';

const HomePage = () => {
  const features = [
    {
      icon: <Camera className="feature-icon" />,
      title: "APOD",
      description: "Discover the cosmos with daily featured images and explanations from NASA's Astronomy Picture of the Day",
      path: "/apod"
    },
    {
      icon: <Globe className="feature-icon" />,
      title: "Moon Surface",
      description: "Explore detailed lunar imagery and surface features captured by NASA's lunar missions",
      path: "/moon"
    },
    {
      icon: <Rocket className="feature-icon" />,
      title: "Mars Rover Photos",
      description: "Browse the latest images captured by NASA's Mars rovers exploring the Red Planet",
      path: "/mars-rover-photos"
    },
    {
      icon: <Target className="feature-icon" />,
      title: "Asteroid Tracker",
      description: "Track near-Earth objects and monitor potentially hazardous asteroids in real-time",
      path: "/asteroid-tracker"
    },
    {
      icon: <BarChart3 className="feature-icon" />,
      title: "Visualizations",
      description: "Interactive data visualizations of NASA's space exploration data and discoveries",
      path: "/visualizations"
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <div className="hero-icon-container">
              <Rocket className="hero-icon" />
            </div>
          </div>
          <h1 className="hero-title">
            NASA <span className="hero-title-gradient">Explorer</span>
          </h1>
          <p className="hero-description">
            Journey through the cosmos with NASA's incredible data and imagery. Explore space missions, astronomical phenomena, and our planet from above.
          </p>
          <div className="hero-buttons">
            <Link to={features[0].path} className="btn-primary"> 
              Start Exploring
            </Link>
            <Link to="/about" className="btn-secondary"> 
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <div className="features-header">
          <h2 className="features-title">
            Explore the Universe
          </h2>
          <p className="features-subtitle">
            Access NASA's vast collection of space data, imagery, and real-time information about our cosmos
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            // Using Link to make each feature card clickable
            <Link to={feature.path} key={index} className="feature-card"> 
              <div className="feature-card-overlay"></div>
              <div className="feature-card-content">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
                <div className="feature-link">
                  Explore
                  <svg className="feature-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div>
              <div className="stat-number">60+</div>
              <div className="stat-label">Years of Space Exploration</div>
            </div>
            <div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">Missions Completed</div>
            </div>
            <div>
              <div className="stat-number">∞</div>
              <div className="stat-label">Possibilities to Discover</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-section">
        <div className="footer-content">
          <p className="footer-text">
            Powered by NASA's Open Data APIs
          </p>
          <div className="footer-links">
            <a href="https://www.nasa.gov/about/" target="_blank" rel="noopener noreferrer" className="footer-link">About</a>
            <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="footer-link">API</a>
            <a href="https://www.nasa.gov/contact/" target="_blank" rel="noopener noreferrer" className="footer-link">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;