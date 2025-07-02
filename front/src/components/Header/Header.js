import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink for navigation
import './Header.css'; // Import its own CSS

const Header = ({ userId }) => {
    return (
        <header className="app-header">
            <div className="header-top-row">
                <div className="logo-group">
                    {/* Placeholder SVG for the logo - you can replace with an image */}
                    <svg className="logo" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                    <h1>Lunar Watch</h1>
                </div>
                <div className="user-id">
                    Explorer ID: <span>{userId}</span>
                </div>
            </div>

            {/* Navigation links moved directly into the header */}
            <nav className="main-nav-in-header"> {/* New class for styling this nav */}
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active-nav-link" : "")
                    }
                >
                    Dashboard
                </NavLink>
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
            </nav>
        </header>
    );
};

export default Header;
