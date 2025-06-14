"use client";

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { ENTITY_CONFIGS } from "@/config/entities";

interface WhiteboardCalendarProps {
    bookingsData: DrizzleData<BookingType>[];
}

export function WhiteboardCalendar({ bookingsData }: WhiteboardCalendarProps) {
    const StudentsIcon = ENTITY_CONFIGS.students.icon;
    const TeachersIcon = ENTITY_CONFIGS.teachers.icon;

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
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                        <StudentsIcon className="w-4 h-4" />
                        Students
                    </h3>
                    <div className="space-y-2 overflow-y-auto max-h-[350px]">
                        <div className="p-2 border rounded-md">Student 1</div>
                        <div className="p-2 border rounded-md">Student 2</div>
                    </div>
                </div>
                
                {/* Teachers Panel */}
                <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                        <TeachersIcon className="w-4 h-4" />
                        Teachers
                    </h3>
                    <div className="space-y-2">
                        <div className="p-2 border rounded-md">Teacher 1</div>
                        <div className="p-2 border rounded-md">Teacher 2</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
