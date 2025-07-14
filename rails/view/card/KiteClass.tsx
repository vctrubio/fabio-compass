import { MapPin } from "lucide-react";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { KiteEventData } from "@/components/hostelworld/types";
import { Separator } from "@/components/ui/separator";

export function KiteClass({ event }: { event: KiteEventData }) {
    const { time, duration, location, students } = event;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 h-full flex flex-col justify-between shadow-sm">
            {/* Header: Start Time and Duration */}
            <div className="flex items-center justify-between pb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {time}
                </h3>
                <span className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm font-medium text-green-700 dark:text-green-200">
                    +
                    {Number.isInteger(duration / 60)
                        ? duration / 60
                        : (duration / 60).toFixed(1)}
                </span>
            </div>

            {/* Location and Capacity */}
            <div className="flex justify-end items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{location}</span>
                </div>
            </div>

            {/* Students */}
            {students.length > 0 && (
                <>
                    <Separator className="my-2" />
                    <div className="flex flex-wrap gap-1 mt-auto">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-sm font-medium"
                            >
                                <HelmetIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                {student.name}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
