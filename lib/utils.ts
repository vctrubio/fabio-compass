import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Time utility functions for whiteboard calculations
export const TimeUtils = {
  // Convert time string to minutes since midnight
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Convert minutes since midnight back to time string
  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  // Add minutes to a time string
  addMinutesToTime: (time: string, minutesToAdd: number): string => {
    const totalMinutes = TimeUtils.timeToMinutes(time) + minutesToAdd;
    return TimeUtils.minutesToTime(totalMinutes);
  },

  // Calculate end time given start time and duration in minutes
  calculateEndTime: (startTime: string, durationMinutes: number): string => {
    return TimeUtils.addMinutesToTime(startTime, durationMinutes);
  },

  // Get difference in minutes between two times
  getTimeDifferenceMinutes: (startTime: string, endTime: string): number => {
    return TimeUtils.timeToMinutes(endTime) - TimeUtils.timeToMinutes(startTime);
  },

  // Check if one time is before another
  isTimeBefore: (time1: string, time2: string): boolean => {
    return TimeUtils.timeToMinutes(time1) < TimeUtils.timeToMinutes(time2);
  },

  // Get current time rounded up to next hour
  getCurrentTimeRoundedUp: (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const roundedHour = currentMinutes > 0 ? currentHour + 1 : currentHour;
    return `${roundedHour.toString().padStart(2, '0')}:00`;
  }
};
