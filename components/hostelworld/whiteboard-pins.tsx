"use client";

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingCard } from "@/rails/view/card/BookingCard";

interface WhiteboardPinsProps {
    bookingsData: DrizzleData<BookingType>[];
}

export function WhiteboardPins({ bookingsData }: WhiteboardPinsProps) {
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
            <div className="max-h-[600px] overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-3">
                    {bookingsData.map(booking => (
                        <BookingCard 
                            key={booking.model.id}
                            booking={booking}
                            headerClassName="bg-gray-50 dark:bg-gray-800"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
