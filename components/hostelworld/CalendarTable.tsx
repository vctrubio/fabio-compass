import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { TeacherEvent } from "./types";
import { TeacherTableRow } from "./TeacherTableRow";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";

interface CalendarTableProps {
    allTeachers: TeacherEvent[];
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    addMinutesToTime: (time: string, minutes: number) => string;
}

export const CalendarTable = ({
    allTeachers,
    teacherEventLinkedList,
    addMinutesToTime,
}: CalendarTableProps) => {
    // Table view header and content - collect all unique event times
    const allEventTimes = new Set<string>();
    allTeachers.forEach((teacher) => {
        const teacherNode = teacherEventLinkedList.getTeacherById(
            teacher.teacher.model.id,
        );
        if (teacherNode) {
            let current = teacherNode.eventHead;
            while (current) {
                allEventTimes.add(current.event.time);
                current = current.next;
            }
        }
    });

    const timeSlots = Array.from(allEventTimes).sort();

    if (timeSlots.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events scheduled for this date
            </div>
        );
    }

    return (
        <div id="table-view-container">
            {/* Table Header with Time Slots */}
            <div
                id="table-schedule-header"
                className="grid gap-0 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2"
                style={{
                    gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)`,
                }}
            >
                <div className="font-bold text-xl flex items-center gap-1 border-r border-gray-300 px-2">
                    <HeadsetIcon className="w-4 h-4" />
                    Teacher
                </div>
                {timeSlots.map((timeSlot, index) => {
                    const isLastColumn = index === timeSlots.length - 1;
                    return (
                        <div
                            key={timeSlot}
                            className={`text-sm font-bold text-center py-2 ${!isLastColumn ? "border-r border-gray-300" : ""}`}
                        >
                            {timeSlot}
                        </div>
                    );
                })}
            </div>

            {/* Table Content */}
            <div className="overflow-visible">
                {allTeachers
                    .map((teacher) => (
                        <TeacherTableRow
                            key={teacher.teacher.model.id}
                            teacher={teacher}
                            teacherEventLinkedList={teacherEventLinkedList}
                            timeSlots={timeSlots}
                            addMinutesToTime={addMinutesToTime}
                        />
                    ))
                    .filter(Boolean)}
            </div>
        </div>
    );
};
