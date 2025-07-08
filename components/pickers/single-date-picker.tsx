'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface SingleDatePickerProps {
  selectedDate?: string;
}

export function SingleDatePicker({ selectedDate }: SingleDatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tempDate, setTempDate] = useState(selectedDate || '');

  const updateDate = (newDate: string) => {
    setTempDate(newDate);
    
    // Update URL with new date
    const params = new URLSearchParams();
    if (newDate) {
      params.set('date', newDate);
    }
    
    const newUrl = `${pathname}${newDate ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    updateDate(newDate);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    // If no date is selected, start from today
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    
    // Reset time to avoid timezone issues
    currentDate.setHours(12, 0, 0, 0);
    
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    const dateString = newDate.toISOString().split('T')[0];
    updateDate(dateString);
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getRelativeDateLabel = (dateString: string): string => {
    if (!dateString) return '';
    
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const targetDate = new Date(dateString);
    targetDate.setHours(12, 0, 0, 0);
    
    const todayDateString = today.toDateString();
    const targetDateString = targetDate.toDateString();
    
    if (todayDateString === targetDateString) return "Today";
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return "";
  };

  const relativeLabel = getRelativeDateLabel(selectedDate || '');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        Filter by Date
        {relativeLabel && (
          <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
            {relativeLabel}
          </span>
        )}
      </label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 border border-border rounded-lg bg-background hover:bg-gray-50 active:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          title="Previous day"
        >
          ←
        </button>
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          className="p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0"
          placeholder="Select date"
        />
        <button
          onClick={() => navigateDate('next')}
          className="p-2 border border-border rounded-lg bg-background hover:bg-gray-50 active:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          title="Next day"
        >
          →
        </button>
      </div>
    </div>
  );
}