'use client';

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { TeacherType } from "@/rails/model/TeacherModel";
import { useState } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import WhiteboardDebug from "./whiteboard-debug";

// Type declaration for the data we're receiving
interface WhiteboardPlanningProps {
    bookingsData: DrizzleData<BookingType>[];
    teachersData: DrizzleData<TeacherType>[];
}

export default function WhiteboardPlanning({ bookingsData, teachersData }: WhiteboardPlanningProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
            {/* Date Navigation */}
            <WhiteboardNavigation 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
            />

            <div className="p-6 space-y-6">
                {/* Debug section with all data */}
                <WhiteboardDebug bookingsData={bookingsData} teachersData={teachersData} />
            </div>
        </div>
    );
}