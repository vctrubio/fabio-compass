import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { TeacherEvent } from "./types";
import { TeacherGridRow } from "./TeacherGridRow";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";

interface CalendarGridDisplayProps {
    allTeachers: TeacherEvent[];
    maxEventSlots: number;
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    addMinutesToTime: (time: string, minutes: number) => string;
}

export const CalendarGridDisplay = ({
    allTeachers,
    maxEventSlots,
    teacherEventLinkedList,
    maxSlots,
    addMinutesToTime,
}: CalendarGridDisplayProps) => {
    // Check if there are any events across all teachers
    const hasAnyEvents = allTeachers.some((teacher) => {
        const teacherNode = teacherEventLinkedList.getTeacherById(
            teacher.teacher.model.id,
        );
        return teacherNode && teacherNode.hasEvents();
    });

    if (!hasAnyEvents) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events scheduled for this date
            </div>
        );
    }

    return (
        <>
            <div
                className={`grid gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2`}
                style={{ gridTemplateColumns: `200px repeat(${maxEventSlots}, 1fr)` }}
            >
                <div className="font-bold text-sm flex items-center gap-1">
                    <HeadsetIcon className="w-4 h-4" />
                    Teacher
                </div>
                {Array.from({ length: maxEventSlots }, (_, index) => (
                    <div key={index} className="text-sm font-bold text-left">
                        Slot {index + 1}
                    </div>
                ))}
            </div>

            {/* Grid Content */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                {allTeachers
                    .map((teacher) => (
                        <TeacherGridRow
                            key={teacher.teacher.model.id}
                            teacher={teacher}
                            teacherEventLinkedList={teacherEventLinkedList}
                            maxSlots={maxSlots}
                            addMinutesToTime={addMinutesToTime}
                        />
                    ))
                    .filter(Boolean)}
            </div>
        </>
    );
};
