import React from 'react';
import './Apod.css'; // Import its own CSS

const ApodDisplay = ({ apodData, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 flex-grow flex items-center justify-center border border-slate-700">
                <p className="text-gray-400 text-lg">Fetching celestial insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 flex-grow flex flex-col items-center justify-center text-red-400 border border-slate-700">
                <p className="text-lg font-semibold mb-2">Failed to load APOD.</p>
                <p className="text-sm text-gray-500">Error: {error.message || 'Unknown error'}</p>
            </div>
        );
    }

    if (!apodData) {
        return (
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 flex-grow flex items-center justify-center border border-slate-700">
                <p className="text-gray-400 text-lg">No APOD data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-7 flex-grow border border-slate-700">
            <h3 className="text-3xl font-bold text-purple-300 mb-5">Astronomy Picture of the Day</h3>
            <div className="flex flex-col items-center text-center">
                <img
                    src={apodData.url}
                    alt={apodData.title}
                    className="w-full h-56 object-cover rounded-xl mb-6 shadow-lg border border-slate-700 transform hover:scale-105 transition-transform duration-300 ease-in-out"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/333333/FFFFFF?text=Image+Not+Available"; }}
                />
                <h4 className="text-2xl font-bold text-sky-300 mb-3 leading-tight">{apodData.title}</h4>
                <p className="text-gray-300 text-md overflow-y-auto max-h-40 custom-scrollbar leading-relaxed">{apodData.explanation}</p>
            </div>
        </div>
    );
};

export default ApodDisplay;