import React, { useState, useMemo } from 'react';
import './Timeline.css';

const Timeline = () => {
    // This data is curated based on publicly available NASA information.
    const allTimelineEvents = useMemo(() => [
        {
            date: '2024',
            title: 'Mission Concept & Design',
            description: 'Initial planning and conceptualization of the VIPER mission, focusing on scientific objectives and instrument development.'
        },
        {
            date: '2025',
            title: 'Instrument Development & Testing',
            description: 'Construction and rigorous testing of VIPER\'s scientific instruments, including the MSolo, NSS, NIRVSS, and TRIDENT.'
        },
        {
            date: '2026',
            title: 'Rover Assembly & Integration',
            description: 'Assembly of the VIPER rover chassis, integration of all instruments, and comprehensive system-level testing.'
        },
        {
            date: 'Late 2026',
            title: 'Launch Readiness & Transport',
            description: 'Final preparations for launch, including fueling and transport to the launch site. VIPER was planned to be delivered to the Moon aboard Astrobotic Technology’s Griffin lunar lander.'
        },
        {
            date: 'July 17, 2024',
            title: 'Mission Cancellation',
            description: 'NASA officially canceled the VIPER mission due to cost growth and delays. The rover was fully assembled at the time of cancellation.'
        },
        {
            date: 'Late 2026/Early 2027',
            title: 'Planned Launch to the Moon',
            description: 'VIPER was planned to launch from Earth, beginning its journey to the Moon, aiming to land near the Moon\'s South Pole.'
        },
        {
            date: 'Early 2027',
            title: 'Planned Lunar Landing & Deployment',
            description: 'Successful landing of the Griffin lander, followed by VIPER\'s deployment onto the lunar surface (as planned).'
        },
        {
            date: '2027-2028',
            title: 'Planned Lunar Surface Operations',
            description: 'VIPER was intended to begin its primary mission of exploring the Moon\'s South Pole, drilling for water ice, and collecting data on lunar resources.'
        },
        {
            date: 'Ongoing',
            title: 'Future of VIPER Instruments',
            description: 'Components and instruments from the built VIPER rover are being considered for reuse in other lunar missions.'
        }
    ], []); // useMemo to ensure data array is stable

    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');

    // Get unique years for the filter dropdown
    const availableYears = useMemo(() => {
        const years = new Set(allTimelineEvents.map(event => event.date.match(/\d{4}/)?.[0]).filter(Boolean));
        return ['All', ...Array.from(years).sort()];
    }, [allTimelineEvents]);

    // Filtered and searched events
    const filteredEvents = useMemo(() => {
        let events = allTimelineEvents;

        // Apply year filter
        if (filterYear && filterYear !== 'All') {
            events = events.filter(event => event.date.includes(filterYear));
        }

        // Apply search term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            events = events.filter(event =>
                event.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                event.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                event.date.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        return events;
    }, [allTimelineEvents, searchTerm, filterYear]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterYear(event.target.value);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterYear('All');
    };

    return (
        <section className="timeline-section">
            <h3>VIPER Mission Timeline</h3>

            <div className="timeline-controls">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="timeline-search-input"
                />
                <select
                    value={filterYear}
                    onChange={handleFilterChange}
                    className="timeline-filter-select"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button onClick={handleClearFilters} className="timeline-clear-button">
                    Clear Filters
                </button>
            </div>

            <div className="timeline-container">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-date-circle">
                                <span className="timeline-date">{event.date}</span>
                            </div>
                            <div className="timeline-content-box">
                                <h4>{event.title}</h4>
                                <p>{event.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="timeline-placeholder">
                        <p>No events match your criteria.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Timeline;
