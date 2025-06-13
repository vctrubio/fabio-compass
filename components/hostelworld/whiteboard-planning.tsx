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
                <div>
                    <label htmlFor="helloInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Update Hello:
                    </label>
                    <input
                        type="text"
                        id="helloInput"
                        value={hello}
                        onChange={(e) => setHello(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Current value: {hello}
                    </p>
                </div>

                <WhiteboardDebug bookingsData={bookingsData} teachersData={teachersData} />
            </div>
        </div>
    );
}