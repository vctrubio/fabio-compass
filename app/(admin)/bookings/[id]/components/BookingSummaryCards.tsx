import React from 'react';
import { BookingWithRelations } from '@/rails/types';

interface BookingSummaryCardsProps {
  booking: BookingWithRelations;
}

export const BookingSummaryCards: React.FC<BookingSummaryCardsProps> = ({ booking }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800">Students</h3>
        <p className="text-2xl font-bold text-blue-600">{booking.lambdas.students.length}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800">Total Lessons</h3>
        <p className="text-2xl font-bold text-green-600">{booking.lambdas.totalLessons}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800">Kite Events</h3>
        <p className="text-2xl font-bold text-purple-600">{booking.lambdas.totalKiteEvents}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800">Package Duration</h3>
        <p className="text-2xl font-bold text-orange-600">{(booking.relations.package?.duration || 0) / 60} h</p>
      </div>
    </div>
  );
};