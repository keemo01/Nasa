import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

// Global Styles
import './styles/App.css';

// Components (Top-level layout elements)
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Timeline from './components/Timeline/Timeline';
import AsteroidTracker from './components/Mission/AsteroidTracker';

// Page Components
import HomePage from './pages/Home/HomePage';
import ApodPage from './pages/ApodPage/ApodPage';
import MoonPage from './pages/Moon/MoonPage';
import MarsRoverPhotosPage from './pages/Mars/RoverPage';
import NASADataVisualizations from './pages/Visualizations/Visualizations';

const App = () => {
  const userId = "lunar-explorer-alpha-7";

  return (
    <Router>
      <div className="app-container">
        <Header userId={userId} />
        <div className="main-page-content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apod" element={<ApodPage />} />
            <Route path="/moon" element={<MoonPage />} />
            <Route path="/mars-rover-photos" element={<MarsRoverPhotosPage />} />
            <Route path="/asteroid-tracker" element={<AsteroidTracker />} />
            <Route path="/visualizations" element={<NASADataVisualizations />} />
          </Routes>
        </div>
        <Timeline />
        <Footer />
      </div>
    </Router>
  );
};

export default App;