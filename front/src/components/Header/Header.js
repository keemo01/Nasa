import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = ({ userId }) => {
    return (
        <header className="app-header">
            <div className="header-top-row">
                <NavLink to="/" className="logo-group">
                    <svg className="logo" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                    <h1>Lunar Watch</h1>
                </NavLink>
                <div className="user-id">
                    Explorer ID: <span>{userId}</span>
                </div>
            </div>

            <nav className="main-nav-in-header">
                <NavLink
                    to="/apod"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    APOD
                </NavLink>
                <NavLink
                    to="/moon"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    Moon Surface
                </NavLink>
                <NavLink
                    to="/mars-rover-photos"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    Mars Rover Photos
                </NavLink>
                <NavLink
                    to="/asteroid-tracker"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    Asteroid Tracker
                </NavLink>
                <NavLink
                    to="/visualizations"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    Visualizations
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;