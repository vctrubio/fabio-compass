'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Users, User, Clock, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { FlagIcon } from '@/assets/svg/FlagIcon';

interface AdminEventBoardProps {
  startingTime?: string;
  eventPlanning: {
    singleDuration: number;
    groupDuration: number;
    location: 'Los Lances' | 'Valdevaqueros';
    submitTime: string;
    gapDuration: number;
  };
  setEventPlanning: React.Dispatch<React.SetStateAction<{
    singleDuration: number;
    groupDuration: number;
    location: 'Los Lances' | 'Valdevaqueros';
    submitTime: string;
    gapDuration: number;
  }>>;
}

const TimeControl = ({ submitTime, onTimeChange, isModified }: { submitTime: string, onTimeChange: (time: string) => void, isModified: boolean }) => {
    const [showInput, setShowInput] = useState(false);

    return (
        <div>
            <div className="flex items-center gap-2">
                <h4 
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 cursor-pointer"
                    onClick={() => setShowInput(!showInput)}
                >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Time: <span className={`ml-1 ${isModified ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200'}`}>{submitTime}</span>
                </h4>
                {showInput && (
                    <input
                        type="time"
                        value={submitTime}
                        onChange={(e) => onTimeChange(e.target.value)}
                        min="09:00"
                        max="21:00"
                        step="1800"
                        className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out border ${
                            isModified ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'
                        } bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto`}
                    />
                )}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onTimeChange('11:00')}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                    11:00
                </button>
                <button
                    onClick={() => onTimeChange('13:00')}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                    13:00
                </button>
                <button
                    onClick={() => onTimeChange('16:00')}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                    16:00
                </button>
            </div>
        </div>
    );
};

const DurationControl = ({ title, options, selectedValue, onSelect }: { title: string, options: { value: number, label: string }[], selectedValue: number, onSelect: (value: number) => void }) => (
  <div>
    <h4 className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
      {title === 'Single' ? <User className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
      {title} Duration
    </h4>
    <div className="flex items-center gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out ${
            selectedValue === option.value
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const LocationControl = ({ selectedValue, onSelect }: { selectedValue: string, onSelect: (value: 'Los Lances' | 'Valdevaqueros') => void }) => (
    <div>
        <h4 className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Location
        </h4>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onSelect('Los Lances')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out ${
                selectedValue === 'Los Lances'
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
            >
                Los Lances
            </button>
            <button
                onClick={() => onSelect('Valdevaqueros')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out ${
                selectedValue === 'Valdevaqueros'
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
            >
                Valdevaqueros
            </button>
        </div>
    </div>
);

export function AdminEventBoard({
    startingTime,
    eventPlanning,
    setEventPlanning
}: AdminEventBoardProps) {
  const isSubmitTimeModified = eventPlanning.submitTime !== startingTime;

  const singleDurationOptions = [
    { value: 60, label: '1h' },
    { value: 120, label: '2h' },
    { value: 180, label: '3h' },
  ];

  const groupDurationOptions = [
    { value: 120, label: '2h' },
    { value: 180, label: '3h' },
    { value: 240, label: '4h' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <FlagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Today's Start Time
                </h3>
                {startingTime ? (
                    <span className={`text-2xl font-bold ${isSubmitTimeModified ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {eventPlanning.submitTime}
                    </span>
                ) : (
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                    No events scheduled
                    </span>
                )}
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <TimeControl
                submitTime={eventPlanning.submitTime}
                onTimeChange={(value) => setEventPlanning(prev => ({ ...prev, submitTime: value }))}
                isModified={isSubmitTimeModified}
            />
            <DurationControl 
                title="Single"
                options={singleDurationOptions}
                selectedValue={eventPlanning.singleDuration}
                onSelect={(value) => setEventPlanning(prev => ({ ...prev, singleDuration: value }))}
            />
            <DurationControl 
                title="Group"
                options={groupDurationOptions}
                selectedValue={eventPlanning.groupDuration}
                onSelect={(value) => setEventPlanning(prev => ({ ...prev, groupDuration: value }))}
            />
            <LocationControl
                selectedValue={eventPlanning.location}
                onSelect={(value) => setEventPlanning(prev => ({ ...prev, location: value }))}
            />
            
        </div>
      </div>
    </div>
  );
}