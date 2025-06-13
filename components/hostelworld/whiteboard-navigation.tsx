'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FormatDateWithWeek } from '@/components/formatters';
import { Button } from '@/components/ui/button';

interface WhiteboardNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WhiteboardNavigation({ selectedDate, onDateChange }: WhiteboardNavigationProps) {
  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const getActualDate = () => {
    return <FormatDateWithWeek dateStr={selectedDate.toISOString()} />;
  };
  
  return (
    <div className="flex items-center justify-center border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-6 w-[500px] justify-between">
        {/* Previous Day Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Date Display */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getActualDate()}
          </span>
        </div>

        {/* Next Day Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Today Button - Always visible with different states */}
        <Button
          variant={isToday ? "secondary" : "default"}
          size="sm"
          onClick={handleToday}
          className={isToday ? "bg-green-500 hover:bg-green-600 text-white" : ""}
        >
          Hoy
        </Button>
      </div>
    </div>
  );
}
