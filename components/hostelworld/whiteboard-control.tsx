"use client";

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";

interface WhiteboardControlProps {
    bookingsData: DrizzleData<BookingType>[];
}

export function WhiteboardControl({ bookingsData }: WhiteboardControlProps) {
    return (
        <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Control Panel</h3>
            <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                    Total bookings: {bookingsData.length}
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors">
                        Filter
                    </button>
                    <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors">
                        Export
                    </button>
                    <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors">
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
