import React from 'react';
import { FormatDateRange } from '@/components/formatters';

interface BookingPeriodProps {
  startDate: string;
  endDate: string;
}

export const BookingPeriod: React.FC<BookingPeriodProps> = ({ startDate, endDate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Booking Period</h2>
      <FormatDateRange 
        startDate={startDate} 
        endDate={endDate} 
      />
    </div>
  );
};