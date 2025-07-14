import React from 'react';
import { BookingWithRelations } from '@/rails/types';

interface BookingHeaderProps {
  booking: BookingWithRelations;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({ booking }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Booking Details</h1>
      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
        <span>ID: {booking.model.id}</span>
        <span>Created: {new Date(booking.model.created_at).toLocaleDateString()}</span>
        {booking.model.signer_pk && (
          <span>Signer: {booking.model.signer_pk.slice(0, 8)}...</span>
        )}
      </div>
    </div>
  );
};