'use client';

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { TeacherType } from "@/rails/model/TeacherModel";
import { ENTITY_CONFIGS } from "@/config/entities";
import { BookingCard } from "@/rails/view/card/BookingCard";

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

// Booking list components

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
      <div className="flex flex-wrap gap-4 max-h-96 overflow-y-auto p-1 justify-around">
        {bookingsData.map((booking) => (
          <div
            key={booking.model.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-all hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
          >
            <BookingCard booking={booking} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Raw data sections component

export default function WhiteboardDebug({ bookingsData, teachersData }: WhiteboardDebugProps) {
  return (
    <div className="space-y-6">
      {/* Summary section */}
      <SummaryCard bookingsData={bookingsData} teachersData={teachersData} />

      {/* Bookings list section */}
      <BookingsList bookingsData={bookingsData} />

      {/* Raw data sections */}
      <RawDataSections bookingsData={bookingsData} teachersData={teachersData} />
    </div>
  );
}



interface RawDataSectionsProps {
  bookingsData: DrizzleData<BookingType>[];
  teachersData: DrizzleData<TeacherType>[];
}

function RawDataSections({ bookingsData, teachersData }: RawDataSectionsProps) {
  return (
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
  );
}