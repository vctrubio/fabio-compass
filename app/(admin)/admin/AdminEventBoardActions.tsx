'use client';

import React from 'react';

interface AdminEventBoardActionsProps {
  onClearAll: () => void;
  onCreateEvents: () => void;
  isLoading: boolean;
}

export function AdminEventBoardActions({ onClearAll, onCreateEvents, isLoading }: AdminEventBoardActionsProps) {
  return (
    <div className="flex justify-end gap-4 mt-4">
      <button
        type="button"
        onClick={onClearAll}
        className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        Clear All
      </button>
      <button
        type="button"
        onClick={onCreateEvents}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Creating...' : 'Create Events'}
      </button>
    </div>
  );
}