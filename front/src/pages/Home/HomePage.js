import React from 'react';
import Mission from '../../components/Mission/MissionLog'; // Assuming Mission.js is the component name
import Facts from '../../components/Facts/Facts'; // Assuming Facts.js is the component name
import './HomePage.css'; // New CSS file for this page

const HomePage = () => {
    return (
        <div className="home-page-container">
            {/* These components now belong to the Home Page */}
            <Mission />
            <Facts />
        </div>
    );
};

export default HomePage;