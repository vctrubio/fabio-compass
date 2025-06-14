"use client";

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingCard } from "@/rails/view/card/BookingCard";
import { ProcessedBookingData } from "./whiteboard-backend";
import { WhiteboardStyles } from "./whiteboard-classes";
import { BookingColorLegend } from "./whiteboard-classes-examples";

interface WhiteboardPinsProps {
    bookingsData: DrizzleData<BookingType>[];
    selectedDate?: Date;
    whiteboardData?: {
        bookings: ProcessedBookingData[];
        getDateData: (date: Date) => {
            totalEvents: Array<{ lesson_id: string; [key: string]: unknown }>;
        };
    };
}

export function WhiteboardPins({ bookingsData, selectedDate, whiteboardData }: WhiteboardPinsProps) {
    if (bookingsData.length === 0) {
        return (
            <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
                <div className="text-center text-muted-foreground">
                    No bookings to display
                </div>
            </div>
        );
    }
   
    return (
        <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-primary">All Bookings</h3>
            </div>
            
            {/* Color Legend */}
            <div className="mb-4">
                <BookingColorLegend />
            </div>
            
            <div className="max-h-[600px] overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-3">
                    {bookingsData.map(booking => (
                        <BookingCard 
                            key={booking.model.id}
                            booking={booking}
                            headerClassName={WhiteboardStyles.getBookingHeaderClass(
                                booking, 
                                selectedDate, 
                                whiteboardData
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
