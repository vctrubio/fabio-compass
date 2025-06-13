'use client';

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { TeacherType } from "@/rails/model/TeacherModel";
import Link from "next/link";
import { ENTITY_CONFIGS } from "@/config/entities";
import { getDateString } from "@/components/getters";

// Type declaration for the lambda values from BookingDrizzle
interface BookingLambdas {
    students: Array<{
        id: string;
        name: string;
        languages: string[];
    }>;
    totalLessons: number;
    totalKiteEvents: number;
}

// Type declaration for the data we're receiving
interface WhiteboardDebugProps {
    bookingsData: DrizzleData<BookingType>[];
    teachersData: DrizzleData<TeacherType>[];
}

// Summary section sub-component
interface SummaryCardProps {
    bookingsData: DrizzleData<BookingType>[];
    teachersData: DrizzleData<TeacherType>[];
}

function SummaryCard({ bookingsData, teachersData }: SummaryCardProps) {
    const totalStudents = bookingsData.reduce((total, booking) => {
        const lambdas = booking.lambdas as BookingLambdas;
        return total + (lambdas?.students?.length || 0);
    }, 0);

    const totalLessons = bookingsData.reduce((total, booking) => {
        const lambdas = booking.lambdas as BookingLambdas;
        return total + (lambdas?.totalLessons || 0);
    }, 0);

    const totalKiteEvents = bookingsData.reduce((total, booking) => {
        const lambdas = booking.lambdas as BookingLambdas;
        return total + (lambdas?.totalKiteEvents || 0);
    }, 0);

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300">
                Planning Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-gray-600 dark:text-gray-400">Total Bookings</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {bookingsData.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-gray-600 dark:text-gray-400">Total Teachers</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {teachersData.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-gray-600 dark:text-gray-400">Total Students</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {totalStudents}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-gray-600 dark:text-gray-400">Total Lessons</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {totalLessons}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-gray-600 dark:text-gray-400">Total Kite Events</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {totalKiteEvents}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Booking row component
interface BookingRowProps {
  booking: DrizzleData<BookingType>;
  index: number;
}

function BookingRow({ booking, index }: BookingRowProps) {
  const searchParams = new URLSearchParams({
    start_date: booking.model.date_start,
    end_date: booking.model.date_end,
  });
  
  const bookingUrl = `/bookings/${booking.model.id}?${searchParams.toString()}`;

  return (
    <Link href={bookingUrl}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ENTITY_CONFIGS.bookings.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Booking #{index + 1}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ID: {booking.model.id}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {getDateString(new Date(booking.model.date_start))} - {getDateString(new Date(booking.model.date_end))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(booking.model.date_start).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false,
                timeZone: 'Europe/Madrid'
              })} - {new Date(booking.model.date_end).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false,
                timeZone: 'Europe/Madrid'
              })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Bookings list component
interface BookingsListProps {
  bookingsData: DrizzleData<BookingType>[];
}

function BookingsList({ bookingsData }: BookingsListProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <ENTITY_CONFIGS.bookings.icon className="h-5 w-5" />
        Bookings ({bookingsData.length})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {bookingsData.map((booking, index) => (
          <BookingRow key={booking.model.id} booking={booking} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function WhiteboardDebug({ bookingsData, teachersData }: WhiteboardDebugProps) {
    return (
        <div className="space-y-6">
            {/* Summary section */}
            <SummaryCard bookingsData={bookingsData} teachersData={teachersData} />

            {/* Bookings list section */}
            <BookingsList bookingsData={bookingsData} />

            {/* Raw data sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings raw data */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Raw Booking Data ({bookingsData.length} bookings)
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
                        {JSON.stringify(bookingsData, null, 2)}
                    </pre>
                </div>

                {/* Teachers raw data */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Raw Teacher Data ({teachersData.length} teachers)
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
                        {JSON.stringify(teachersData, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
