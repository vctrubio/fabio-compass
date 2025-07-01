"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FormatDateWithWeek } from "@/components/formatters";
import { Button } from "@/components/ui/button";

interface WhiteboardNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WhiteboardNavigation({
  selectedDate,
  onDateChange,
}: WhiteboardNavigationProps) {
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
    const date = selectedDate;
    const now = new Date();
    const daysDiff = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const getDateTypeConfig = () => {
      const isToday = date.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      if (isToday) {
        return { label: "Hoy", colors: "border-b-2 border-green-500" };
      }
      if (isTomorrow) {
        return { label: "Mañana", colors: "border-b-2 border-blue-500" };
      }
      if (daysDiff < 0 && !isToday) {
        const daysAgo = Math.abs(daysDiff);
        return {
          label: `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`,
          colors: "border-b-2 border-muted-foreground",
        };
      }
      const weekday = date.toLocaleString("es-ES", {
        weekday: "long",
        timeZone: "Europe/Madrid",
      });
      return { label: weekday, colors: "border-b-2 border-accent" };
    };

    const dateTypeInfo = getDateTypeConfig();
    const dateString = date.toLocaleString("es-ES", {
      day: "numeric",
      month: "long",
    });

    return (
      <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-sm px-2">
        <div
          className={`px-3 py-1.5 text-xs font-medium ${dateTypeInfo.colors}`}
        >
          {dateTypeInfo.label}
        </div>
        <div className="px-3 py-1.5 text-xs text-foreground">{dateString}</div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-6 w-[600px] justify-between">
        {/* Date Display with Navigation */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousDay}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getActualDate()}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
          />
        </div>

        {/* Today Button - Always visible with different states */}
        <Button
          variant={isToday ? "secondary" : "default"}
          size="sm"
          onClick={handleToday}
          className={
            isToday ? "bg-green-500 hover:bg-green-600 text-white" : ""
          }
        >
          Hoy
        </Button>
      </div>
    </div>
  );
}
