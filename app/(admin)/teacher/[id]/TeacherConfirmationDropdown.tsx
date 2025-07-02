'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TeacherConfirmationDropdownProps {
  eventId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  isLessonStatus?: boolean;
}

const kiteEventStatusOptions = [
  { value: 'planned', label: 'Confirm as Planned', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Mark as Completed', color: 'bg-green-100 text-green-800' },
  { value: 'plannedAuto', label: 'Auto-Planned', color: 'bg-blue-100 text-blue-800' },
];

const lessonStatusOptions = [
  { value: 'planned', label: 'Planned', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ongoing', label: 'Ongoing', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'delegated', label: 'Delegated', color: 'bg-purple-100 text-purple-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export function TeacherConfirmationDropdown({ 
  eventId, 
  currentStatus, 
  onStatusChange,
  isLessonStatus = false
}: TeacherConfirmationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = isLessonStatus ? lessonStatusOptions : kiteEventStatusOptions;
  
  const getCurrentStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={cn(
          "inline-flex justify-center items-center px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors",
          getCurrentStatusColor(currentStatus),
          "hover:opacity-80",
          isUpdating && "opacity-50 cursor-not-allowed"
        )}
      >
        {isUpdating ? 'Updating...' : currentStatus}
        <svg
          className="-mr-1 ml-1 h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b">
                Update {isLessonStatus ? 'Lesson' : 'Event'} Status
              </div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isUpdating}
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", option.color)}>
                      {option.value}
                    </span>
                  </div>
                </button>
              ))}
              <div className="border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}