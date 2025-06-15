'use client';

import React, { memo, useCallback } from 'react';
import { Clock, Timer, MapPin, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { TimeUtils } from './whiteboard-backend';
import { KiteEventData } from './types';

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
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleHourChange(-1)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronDown className="w-3 h-3" />
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
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleMinuteChange(-30)}
                            className="px-1 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronDown className="w-3 h-3" />
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
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
        <Timer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
        <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
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
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
        <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
        <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
            <button
                onClick={() => onChange('Los Lances')}
                className={`px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    location === 'Los Lances' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : ''
                }`}
            >
                Los Lances
            </button>
            <button
                onClick={() => onChange('Valdevaqueros')}
                className={`px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
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

// Pushback control component
export const PushbackControl = ({ 
    onClick,
    todayKiteEvents
}: { 
    onClick: () => void;
    todayKiteEvents?: KiteEventData[];
}) => {
    const eventCount = todayKiteEvents?.length || 0;

    if (eventCount === 0) {
        return <></>;
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
            <button
                onClick={onClick}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
                --Reschedule-- ({eventCount})
            </button>
        </div>
    );
};