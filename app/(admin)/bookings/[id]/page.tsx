import React from 'react';
import { drizzleBookingById } from '@/rails/controller/BookingDrizzle';
import { FormatDateRange } from '@/components/formatters';
import { BookingWithRelations } from '@/rails/types';

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const bookingId = params.id;
  
  const booking: BookingWithRelations | null = await drizzleBookingById(bookingId);

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Booking Not Found</h1>
          <p className="text-gray-600 mt-2">The booking with ID {bookingId} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>ID: {booking.model.id}</span>
          <span>Created: {new Date(booking.model.created_at).toLocaleDateString()}</span>
        </div>
      </div>

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
          <p className="text-2xl font-bold text-orange-600">{booking.relations.package?.duration || 0} min</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Booking Period</h2>
          <FormatDateRange 
            startDate={booking.model.date_start} 
            endDate={booking.model.date_end} 
          />
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Students ({booking.lambdas.students.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.lambdas.students.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">ID: {student.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Package Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Package Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-800">Description</h4>
              <p className="text-gray-600">{booking.relations.package?.description || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Duration</h4>
              <p className="text-gray-600">{booking.relations.package?.duration || 0} minutes</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Price</h4>
              <p className="text-gray-600">€{booking.relations.package?.price || 0}</p>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lessons ({booking.lambdas.totalLessons})</h2>
          <div className="space-y-4">
            {booking.relations.lessons?.map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Lesson {lesson.id.slice(0, 8)}...</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                    lesson.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lesson.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Teacher: {lesson.teacher?.name || 'Not assigned'}</p>
                  <p>Kite Events: {lesson.kiteEvents?.length || 0}</p>
                </div>
                {lesson.kiteEvents && lesson.kiteEvents.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm mb-1">Kite Events:</h4>
                    <div className="space-y-1">
                      {lesson.kiteEvents.map((event) => (
                        <div key={event.id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span>{new Date(event.date).toLocaleString()}</span>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>{event.duration} min</span>
                            <span className={`px-1 rounded ${
                              event.status === 'completed' ? 'bg-green-100 text-green-800' :
                              event.status === 'teacherConfirmation' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}