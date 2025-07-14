import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { KiteClass } from "@/rails/view/card/KiteClass";
import { TeacherEvent } from "./types";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";

interface TeacherTableRowProps {
    teacher: TeacherEvent;
    teacherEventLinkedList: TeacherEventLinkedList;
    timeSlots: string[];
    addMinutesToTime: (time: string, minutes: number) => string;
}

export const TeacherTableRow = ({
    teacher,
    teacherEventLinkedList,
    timeSlots,
}: TeacherTableRowProps) => {
    const teacherNode = teacherEventLinkedList.getTeacherById(
        teacher.teacher.model.id,
    );

    // Get all events for this teacher in order
    const teacherEvents: Array<{
        id: string;
        time: string;
        duration: number;
        date: string;
        status: string;
        location: string;
        students: Array<{ id: string; name: string }>;
    }> = [];

    if (teacherNode) {
        let current = teacherNode.eventHead;
        while (current) {
            teacherEvents.push(current.event);
            current = current.next;
        }
    }

    // Don't render teachers with no events
    if (teacherEvents.length === 0) {
        return null;
    }

    // Create a map of events by their start time
    const eventsByTime = new Map<string, (typeof teacherEvents)[0]>();
    teacherEvents.forEach((event) => {
        eventsByTime.set(event.time, event);
    });

    return (
        <div
            key={teacher.teacher.model.id}
            className="grid gap-0 border-b border-gray-200 dark:border-gray-600 py-2"
            style={{
                gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)`,
            }}
        >
            {/* Teacher Name */}
            <div className="font-medium text-xl truncate flex items-center gap-1 border-r border-gray-300 px-2">
                <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{teacher.teacher.model.name}</span>
            </div>

            {/* Time Slots - show event if it matches this time, empty otherwise */}
            {timeSlots.map((timeSlot, slotIndex) => {
                const event = eventsByTime.get(timeSlot);
                const isLastColumn = slotIndex === timeSlots.length - 1;

                return (
                    <div
                        key={`${teacher.teacher.model.id}-${timeSlot}`}
                        className={`min-h-[60px] p-2 ${!isLastColumn ? "border-r border-gray-300" : ""}`}
                    >
                        {event ? (
                            <KiteClass event={event} viewFooter={false} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
