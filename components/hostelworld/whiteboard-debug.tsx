'use client';

import { useState } from 'react';
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { ENTITY_CONFIGS } from "@/config/entities";
import { BookingCard } from "@/rails/view/card/BookingCard";
import { BookingStr } from "@/rails/view/str/BookingStr";
import { WhiteboardStyles } from "./whiteboard-classes";

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
}

// Summary section sub-component
interface SummaryCardProps {
  bookingsData: DrizzleData<BookingType>[];
}

function SummaryCard({ bookingsData }: SummaryCardProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="font-medium text-gray-600 dark:text-gray-400">Total Bookings</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
            {bookingsData.length}
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
            <BookingCard 
              booking={booking} 
              headerClassName={WhiteboardStyles.getBookingHeaderClassBasic(booking)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhiteboardDebugDraw({ bookingsData }: WhiteboardDebugProps) {
  return (
    <div className="space-y-6">
      {/* Summary section */}
      <SummaryCard bookingsData={bookingsData} />

      {/* Bookings list section */}
      <BookingsList bookingsData={bookingsData} />

      {/* Raw data sections */}
      <RawDataSections bookingsData={bookingsData} />
    </div>
  );
}

interface RawDataSectionsProps {
  bookingsData: DrizzleData<BookingType>[];
}

function RawDataSections({ bookingsData }: RawDataSectionsProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Bookings raw data */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Raw Booking Data ({bookingsData.length} bookings)
        </h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto max-h-96 text-gray-800 dark:text-gray-200">
          {JSON.stringify(bookingsData, null, 2)}
        </pre>
      </div>
    </div>
  );
}



const BookingList = ({ bookings }: { bookings: DrizzleData<BookingType>[] }) => {
    if (bookings.length === 0) {
        return (
            <div className="p-4 text-center border border-dashed rounded-md border-muted">
                <p className="text-muted-foreground">
                    No bookings found for this date
                </p>
            </div>
        );
    }

    return (
        <div className="max-h-[600px] overflow-y-auto pr-1 flex flex-wrap gap-3 items-center">
            {bookings.map(booking => {
                const packageData = (booking.relations as { package?: { duration: number } })?.package;
                const packageMinutes = packageData?.duration || 0;

                const lessons = (booking.relations as {
                    lessons?: Array<{
                        id: string;
                        kiteEvents?: Array<{ duration: number }>
                    }>
                })?.lessons || [];

                const allKiteEvents = lessons.flatMap(lesson => lesson.kiteEvents || []);
                const totalKitingMinutes = allKiteEvents.reduce(
                    (sum, kiteEvent) => sum + (kiteEvent.duration || 0),
                    0
                );

                return (
                    <div
                        key={booking.model?.id}
                        className="p-3 bg-white dark:bg-gray-950/50 rounded-md border 
                              border-gray-100 dark:border-gray-800 hover:border-gray-300
                              dark:hover:border-gray-700 transition-all"
                    >
                        <div className="flex flex-col gap-1">

                            <BookingStr
                                dateRange={{
                                    startDate: booking.model.date_start,
                                    endDate: booking.model.date_end
                                }}
                                usedMinutes={totalKitingMinutes}
                                totalMinutes={packageMinutes}
                            />
                            <div className="text-xs text-muted-foreground">
                                id: {booking.model.id}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const BookingDebugShow = ({
    bookings,
    formattedDate
}: {
    bookings: DrizzleData<BookingType>[],
    formattedDate: string
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const filteredCount = bookings.length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Booking Debug: {formattedDate}
                    </h2>
                    <div className="px-2 py-0.5 rounded-md bg-secondary dark:bg-secondary/70 text-secondary-foreground text-xs font-medium">
                        {filteredCount} bookings
                    </div>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm px-3 py-1 rounded bg-secondary hover:bg-secondary/80 
                            text-secondary-foreground transition-colors"
                >
                    {showDetails ? "Hide Details" : "Show Details"}
                </button>
            </div>

            {showDetails && (
                <div className="animate-in fade-in-50 slide-in-from-top-3 duration-300">
                    <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
                        <BookingList bookings={bookings} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function WhiteboardDebug({ bookingsData }: WhiteboardDebugProps) {
  return (
    <div className="space-y-6">
      <SummaryCard bookingsData={bookingsData} />
      <BookingsList bookingsData={bookingsData} />
      <RawDataSections bookingsData={bookingsData} />
    </div>
  );
}
