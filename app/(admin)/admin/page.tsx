import React from 'react';
import Link from 'next/link';
import { drizzleBookingsSortedByDate } from '@/rails/controller/BookingDrizzle';
import { FormatDateRange } from '@/components/formatters';
import { BookingWithRelations } from '@/rails/types';
import { SingleDatePicker } from '@/components/pickers/single-date-picker';

interface AdminPageProps {
  searchParams: {
    date?: string;
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const allBookings: BookingWithRelations[] = await drizzleBookingsSortedByDate();
  const selectedDate = searchParams.date;

  // Filter bookings based on selected date if provided
  const filteredBookings = selectedDate 
    ? allBookings.filter((booking) => {
        const bookingStart = new Date(booking.model.date_start);
        const bookingEnd = new Date(booking.model.date_end);
        const filterDate = new Date(selectedDate);
        
        // Set time to start and end of day for comparison
        const filterDateStart = new Date(filterDate);
        filterDateStart.setHours(0, 0, 0, 0);
        
        const filterDateEnd = new Date(filterDate);
        filterDateEnd.setHours(23, 59, 59, 999);
        
        // Check if booking overlaps with selected date
        return bookingStart <= filterDateEnd && bookingEnd >= filterDateStart;
      })
    : allBookings;

  const bookings = filteredBookings;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {selectedDate 
                ? `Bookings for ${new Date(selectedDate).toLocaleDateString()}`
                : 'All bookings sorted by start date'
              }
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <SingleDatePicker selectedDate={selectedDate} />
            {selectedDate && (
              <Link 
                href="/admin" 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors h-fit"
              >
                Clear Filter
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings ({bookings.length})</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {selectedDate 
                  ? `No bookings found for ${new Date(selectedDate).toLocaleDateString()}`
                  : 'No bookings found.'
                }
              </p>
              {selectedDate && (
                <Link 
                  href="/admin" 
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  View All Bookings
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link 
                  key={booking.model.id} 
                  href={`/bookings/${booking.model.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <FormatDateRange 
                        startDate={booking.model.date_start} 
                        endDate={booking.model.date_end} 
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {booking.model.id.slice(0, 8)}...
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-1">Students:</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.lambdas.students.length > 0 ? (
                        booking.lambdas.students.map((student) => (
                          <span 
                            key={student.id} 
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                          >
                            {student.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No students assigned</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Package: {booking.relations.package?.description || 'N/A'}</span>
                    <span>Duration: {booking.relations.package?.duration || 0} minutes</span>
                    <span>Lessons: {booking.lambdas.totalLessons}</span>
                    <span>Kite Events: {booking.lambdas.totalKiteEvents}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}