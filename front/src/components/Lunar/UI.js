import React from 'react';

export const MissionHeader = () => (
    <div className="absolute top-6 left-6 z-10">
        <h1 className="text-4xl font-bold text-white mb-2 bg-slate-800/90 px-4 py-2 rounded-lg backdrop-blur-sm">
            VIPER Lunar Mission
        </h1>
        <p className="text-slate-300 bg-slate-800/70 px-3 py-1 rounded-md backdrop-blur-sm">
            Volatiles Investigating Polar Exploration Rover
        </p>
    </div>
);

export const MissionControls = ({ isPlaying, onTogglePlay, speed, onSpeedChange, cameraMode, onCameraChange, showPath, onTogglePath }) => (
    <div className="absolute top-6 right-6 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 min-w-64">
        <h3 className="text-white font-semibold mb-3">Mission Controls</h3>
        <div className="mb-4">
            <button
                onClick={onTogglePlay}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                {isPlaying ? '⏸ Pause Mission' : '▶ Start Mission'}
            </button>
        </div>
        <div className="mb-4">
            <label className="text-white text-sm mb-1 block">Speed: {speed.toFixed(2)}x</label>
            <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.01"
                value={speed}
                onChange={onSpeedChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700"
            />
        </div>
        <div className="mb-4">
            <label className="text-white text-sm mb-2 block">Camera Mode</label>
            <select
                value={cameraMode}
                onChange={onCameraChange}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg"
            >
                <option value="orbit">Orbit</option>
                <option value="follow">Follow</option>
                <option value="first-person">First-Person</option>
            </select>
        </div>
        <div className="flex items-center">
            <input
                type="checkbox"
                id="show-path"
                checked={showPath}
                onChange={onTogglePath}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
            />
            <label htmlFor="show-path" className="ml-2 text-sm font-medium text-gray-300">Show Path</label>
        </div>
    </div>
);

export const MissionStatus = ({ missionData }) => (
    <div className="absolute bottom-6 left-6 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 text-white w-80">
        <h3 className="text-white font-semibold mb-3 border-b border-slate-600 pb-2">Mission Status</h3>
        <div className="text-sm space-y-3">
            <div className="flex justify-between items-center">
                <span>Progress:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">{missionData.progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${missionData.progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
                <span>Position:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">
                   {missionData.position.lat.toFixed(1)}° lat, {missionData.position.lon.toFixed(1)}° lon
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span>Terrain:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">{missionData.terrain}</span>
            </div>
            <div className="flex justify-between items-center">
                <span>Battery:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">{missionData.battery.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${missionData.battery}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
                <span>Core Temp:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">{missionData.temperature.toFixed(1)}° C</span>
            </div>
            <div className="flex justify-between items-center">
                <span>Samples:</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">{missionData.samples} / 10</span>
            </div>
        </div>
    </div>
);