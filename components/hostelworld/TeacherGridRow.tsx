import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { KiteClass } from "@/rails/view/card/KiteClass";
import { TeacherEvent } from "./types";
import { TeacherEventLinkedList } from "./teacher-event-linked-list";

interface TeacherGridRowProps {
    teacher: TeacherEvent;
    teacherEventLinkedList: TeacherEventLinkedList;
    maxSlots: number;
    addMinutesToTime: (time: string, minutes: number) => string;
}

export const TeacherGridRow = ({
    teacher,
    teacherEventLinkedList,
    maxSlots,
    addMinutesToTime,
}: TeacherGridRowProps) => {
    const teacherNode = teacherEventLinkedList.getTeacherById(
        teacher.teacher.model.id,
    );

    const eventsWithGaps: Array<{
        type: "event" | "gap";
        data?: any;
        time?: string;
        gapMinutes?: number;
    }> = [];

    if (teacherNode) {
        // Iterate through events using the linked list structure
        let current = teacherNode.eventHead;

        while (current) {
            // Add the current event
            eventsWithGaps.push({ type: "event", data: current.event });

            // Check for gap to next event
            if (current.next) {
                const currentEndTime = addMinutesToTime(
                    current.event.time,
                    current.event.duration,
                );
                const nextStartTime = current.next.event.time;

                // Calculate gap in minutes
                const [currentHours, currentMins] = currentEndTime
                    .split(":")
                    .map(Number);
                const [nextHours, nextMins] = nextStartTime.split(":").map(Number);
                const currentEndMinutes = currentHours * 60 + currentMins;
                const nextStartMinutes = nextHours * 60 + nextMins;
                const gapMinutes = nextStartMinutes - currentEndMinutes;

                if (gapMinutes > 15) {
                    // Only show significant gaps
                    eventsWithGaps.push({
                        type: "gap",
                        time: currentEndTime,
                        gapMinutes: gapMinutes,
                    });
                }
            }

            current = current.next;
        }
    }

    // Don't render teachers with no events in grid view if there are no events
    if (eventsWithGaps.length === 0) {
        return null;
    }

    return (
        <div
            key={teacher.teacher.model.id}
            className={`grid gap-2 border-b border-gray-200 dark:border-gray-600 py-2`}
            style={{ gridTemplateColumns: `200px repeat(${maxSlots}, 1fr)` }}
        >
            {/* Teacher Name */}
            <div className="font-medium text-sm truncate flex items-center gap-1">
                <HeadsetIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{teacher.teacher.model.name}</span>
            </div>

            {/* Event and Gap Slots */}
            {Array.from({ length: maxSlots }, (_, slotIndex) => {
                const item = eventsWithGaps[slotIndex];

                return (
                    <div
                        key={`${teacher.teacher.model.id}-slot-${slotIndex}`}
                        className="min-h-[80px]"
                    >
                        {item ? (
                            item.type === "event" ? (
                                <KiteClass event={item.data} />
                            ) : (
                                // Gap
                                <div className="h-full bg-yellow-50 dark:bg-yellow-900/20 border border-dashed border-yellow-300 dark:border-yellow-600 rounded-lg p-2 min-h-[80px] flex items-center justify-center">
                                    <div className="text-center text-yellow-600 dark:text-yellow-400">
                                        <div className="font-medium">Gap</div>
                                        <div className="text-xs mt-1">{item.gapMinutes}mins</div>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Empty slot - show nothing
                            <div className="min-h-[80px]"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
