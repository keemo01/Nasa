import React, { useState, useCallback } from 'react';
import './Mission.css'; // Import its own CSS

const MissionLog = () => {
    const [missionLog, setMissionLog] = useState([]);
    const [newLogEntry, setNewLogEntry] = useState('');

    const addMissionLogEntry = useCallback((entryText) => {
        if (entryText.trim()) {
            const newLog = {
                id: Date.now(),
                text: entryText,
                timestamp: Date.now(),
            };
            setMissionLog((prevLogs) => [newLog, ...prevLogs].sort((a, b) => b.timestamp - a.timestamp));
            setNewLogEntry('');
        }
    }, []);

    return (
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-7 flex-grow border border-slate-700">
            <h3 className="text-3xl font-bold text-purple-300 mb-5">Live Mission Log</h3>
            <div className="h-56 overflow-y-auto bg-slate-800 p-4 rounded-xl mb-6 custom-scrollbar border border-slate-700">
                {missionLog.length > 0 ? (
                    missionLog.map((log, index) => (
                        <p key={log.id} className={`text-gray-300 text-sm mb-2 p-2 rounded-md ${index % 2 === 0 ? 'bg-slate-700 bg-opacity-50' : 'bg-slate-700 bg-opacity-20'}`}>
                            <span className="text-sky-300 font-mono text-xs mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.text}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-8">No mission log entries yet. Add the first dispatch!</p>
                )}
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                addMissionLogEntry(newLogEntry);
            }} className="flex">
                <input
                    type="text"
                    name="missionEntry"
                    placeholder="Enter new log entry..."
                    className="flex-grow p-3 rounded-l-xl bg-slate-800 text-gray-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    value={newLogEntry}
                    onChange={(e) => setNewLogEntry(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-r-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    Add Log
                </button>
            </form>
        </div>
    );
};

export default MissionLog;