'use client';

import React, { memo, useCallback } from 'react';
import { TimeUtils } from './whiteboard-backend';

// Time control component
export const TimeControl = memo(({ 
    submitTime, 
    onTimeChange 
}: { 
    submitTime: string; 
    onTimeChange: (time: string) => void 
}) => {
    const handleHourChange = useCallback((increment: number) => {
        const newTime = TimeUtils.adjustTime(submitTime, increment, 0);
        onTimeChange(newTime);
    }, [submitTime, onTimeChange]);

    const handleMinuteChange = useCallback((increment: number) => {
        const newTime = TimeUtils.adjustTime(submitTime, 0, increment);
        onTimeChange(newTime);
    }, [submitTime, onTimeChange]);

    const handlePresetClick = useCallback((time: string) => {
        onTimeChange(time);
    }, [onTimeChange]);

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-sm text-gray-600 dark:text-gray-400">Submit Time:</span>
            <div className="flex items-center gap-2">
                {/* Custom Time Picker */}
                <div className="flex items-center bg-white dark:bg-gray-800 border rounded">
                    {/* Hour Controls */}
                    <div className="flex flex-col">
                        <button
                            type="button"
                            onClick={() => handleHourChange(1)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            onClick={() => handleHourChange(-1)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ▼
                        </button>
                    </div>
                    
                    {/* Time Display */}
                    <div className="px-3 py-1 text-sm font-mono">
                        {submitTime}
                    </div>
                    
                    {/* Minute Controls (30-minute increments) */}
                    <div className="flex flex-col">
                        <button
                            type="button"
                            onClick={() => handleMinuteChange(30)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            onClick={() => handleMinuteChange(-30)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ▼
                        </button>
                    </div>
                </div>
                
                {/* Quick time presets */}
                <div className="flex items-center gap-1">
                    {['11:00', '13:00', '16:00'].map(time => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => handlePresetClick(time)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                submitTime === time 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});

TimeControl.displayName = 'TimeControl';

// Duration control component
export const DurationControl = ({ 
    label, 
    value, 
    onChange, 
    options 
}: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    options: { value: number; label: string }[] 
}) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
        <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        value === option.value 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                            : ''
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

// Location control component
export const LocationControl = ({ 
    location, 
    onChange 
}: { 
    location: string; 
    onChange: (location: 'Los Lances' | 'Valdevaqueros') => void 
}) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
        <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
        <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
            <button
                onClick={() => onChange('Los Lances')}
                className={`px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    location === 'Los Lances' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : ''
                }`}
            >
                Los Lances
            </button>
            <button
                onClick={() => onChange('Valdevaqueros')}
                className={`px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    location === 'Valdevaqueros' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : ''
                }`}
            >
                Valdevaqueros
            </button>
        </div>
    </div>
);