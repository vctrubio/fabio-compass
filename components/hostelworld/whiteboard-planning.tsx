"use client";

import { useState, useMemo } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import { useAdmin } from "@/components/providers/AdminProvider";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingStr } from "@/rails/view/str/BookingStr";
import { formatDateNow } from "@/components/formatters";

// BookingList component to display all filtered bookings
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
                // Extract package data for progress bar
                const packageData = (booking.relations as { package?: any })?.package;
                const packageMinutes = packageData?.duration || 0;

                // Calculate total kiting minutes from all events
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
                        <BookingStr
                            dateRange={{
                                startDate: booking.model.date_start,
                                endDate: booking.model.date_end
                            }}
                            usedMinutes={totalKitingMinutes}
                            totalMinutes={packageMinutes}
                        />
                    </div>
                );
            })}
        </div>
    );
};

// BookingsHeader component to display booking count and info
const BookingsHeader = ({
    filteredCount,
    totalCount
}: {
    filteredCount: number,
    totalCount: number
}) => (
    <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-primary">
            {filteredCount} bookings found for this date
            <span className="text-muted-foreground ml-1">
                (out of {totalCount} total)
            </span>
        </p>
    </div>
);

// BookingDebug component that includes controls and state management
const BookingDebug = ({
    bookings,
    formattedDate
}: {
    bookings: DrizzleData<BookingType>[],
    formattedDate: string
}) => {
    const [showDetails, setShowDetails] = useState(true);

    // Calculate total counts internally
    const filteredCount = bookings.length;

    return (
        <div className="space-y-3">
            {/* Controls */}
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

            {/* Details panel with animation */}
            {showDetails && (
                <div className="animate-in fade-in-50 slide-in-from-top-3 duration-300">
                    <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
                        <BookingsHeader
                            filteredCount={filteredCount}
                            totalCount={filteredCount}
                        />
                        <BookingList bookings={bookings} />
                    </div>
                </div>
            )}
        </div>
    );
};

// WhiteboardCalendar component to display calendar and sidebar panels
const WhiteboardCalendar = () => {
    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Calendar - takes 9 columns on desktop, full width on mobile */}
            <div className="col-span-12 lg:col-span-9 border rounded-md p-4">
                <h3 className="font-medium mb-2">Calendar View</h3>
                <div className="h-96 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-muted-foreground">
                    Calendar Placeholder
                </div>
            </div>
            
            {/* Student and Teachers panels - 3 columns on desktop, full width on mobile */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full">
                {/* Students Panel - with flex-grow to use available space */}
                <div className="border rounded-md p-4 flex-grow">
                    <h3 className="font-medium mb-2">Students</h3>
                    <div className="space-y-2 overflow-y-auto max-h-[350px]">
                        <div className="p-2 border rounded-md">Student 1</div>
                        <div className="p-2 border rounded-md">Student 2</div>
                    </div>
                </div>
                
                {/* Teachers Panel */}
                <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Teachers</h3>
                    <div className="space-y-2">
                        <div className="p-2 border rounded-md">Teacher 1</div>
                        <div className="p-2 border rounded-md">Teacher 2</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component that orchestrates everything
export default function WhiteboardPlanning() {
    const { bookingsData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Function to check if a booking falls on the selected date
    const isBookingOnDate = (booking: DrizzleData<BookingType>, date: Date) => {
        const bookingStart = new Date(booking.model.date_start);
        const bookingEnd = new Date(booking.model.date_end);

        // Set time to start of day for comparison
        const selectedDateStart = new Date(date);
        selectedDateStart.setHours(0, 0, 0, 0);

        // Set time to end of day for comparison
        const selectedDateEnd = new Date(date);
        selectedDateEnd.setHours(23, 59, 59, 999);

        // Check if booking overlaps with the selected date
        return bookingStart <= selectedDateEnd && bookingEnd >= selectedDateStart;
    };

    // Filter bookings for selected date
    const filteredBookings = useMemo(() => {
        return bookingsData.filter((booking) => isBookingOnDate(booking, selectedDate));
    }, [bookingsData, selectedDate]);

    // Format date once for reuse
    const formattedDate = formatDateNow(selectedDate);

    return (
        <div className="dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800">
            {/* Date Navigation */}
            <WhiteboardNavigation
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            <div className="p-6 space-y-4">
                <BookingDebug
                    bookings={filteredBookings}
                    formattedDate={formattedDate}
                />
            </div>

            <div className="flex flex-col gap-2 p-2">
                <div className="border">helloworld</div>
                <div className="border">control panell</div>
                
                {/* Use the new WhiteboardCalendar component */}
                <WhiteboardCalendar />
            </div>
        </div>
    );
}