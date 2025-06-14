"use client";

import { useState, useMemo } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import { WhiteboardCalendar } from "./whiteboard-calendar";
import { WhiteboardControl } from "./whiteboard-control";
import { WhiteboardPins } from "./whiteboard-pins";
import { useAdmin } from "@/components/providers/AdminProvider";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { formatDateNow } from "@/components/formatters";
import { BookingDebugShow } from "./whiteboard-debug";

export default function WhiteboardPlanning() {
    const { bookingsData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const isBookingOnDate = (booking: DrizzleData<BookingType>, date: Date) => {
        const bookingStart = new Date(booking.model.date_start);
        const bookingEnd = new Date(booking.model.date_end);

        const selectedDateStart = new Date(date);
        selectedDateStart.setHours(0, 0, 0, 0);

        const selectedDateEnd = new Date(date);
        selectedDateEnd.setHours(23, 59, 59, 999);

        return bookingStart <= selectedDateEnd && bookingEnd >= selectedDateStart;
    };

    const filteredBookings = useMemo(() => {
        return bookingsData.filter((booking) => isBookingOnDate(booking, selectedDate));
    }, [bookingsData, selectedDate]);

    return (
        <div className="dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800">
            <WhiteboardNavigation
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            <div className="flex flex-col gap-2 p-2">
                <WhiteboardPins bookingsData={filteredBookings} />
                <WhiteboardControl />
                <WhiteboardCalendar bookingsData={filteredBookings} />
            </div>
        </div>
    );
}