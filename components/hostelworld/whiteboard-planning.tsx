'use client';

import { useState } from "react";
import { WhiteboardNavigation } from "./whiteboard-navigation";
import WhiteboardDebug from "./whiteboard-debug";
import { useAdmin } from "@/components/providers/AdminProvider";

export default function WhiteboardPlanning() {
    const { bookingsData, teachersData } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hello, setHello] = useState("world");

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
            {/* Date Navigation */}
            <WhiteboardNavigation
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            <div className="p-6 space-y-6">
                <WhiteboardDebug bookingsData={bookingsData} teachersData={teachersData} />
            </div>
        </div>
    );
}