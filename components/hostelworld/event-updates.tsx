import React, { useState, useEffect, useMemo } from "react";
import { updateKiteEventsWithCalculatedTimeAction, deleteKiteEvent } from "@/actions/kite-actions";
import { KiteEventData, DurationSettings } from "./types";
import { formatDuration } from "@/components/formatters";
import { toast } from "sonner";

interface UpdateKiteEventsDisplayProps {
    todayKiteEvents?: KiteEventData[];
    submitTime: string;
    location: string;
    durations: DurationSettings;
    selectedDate: Date;
    onClose: () => void;
}

const UpdateKiteEventsDisplay: React.FC<UpdateKiteEventsDisplayProps> = ({
    todayKiteEvents,
    submitTime,
    location,
    durations,
    selectedDate,
    onClose,
}) => {
    const [reorderedEvents, setReorderedEvents] = useState<Record<string, KiteEventData[]>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [eventGaps, setEventGaps] = useState<Record<string, number>>({});
    const [targetDate, setTargetDate] = useState<Date>(selectedDate);
    const [expandedTeachers, setExpandedTeachers] = useState<Record<string, boolean>>({});
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setTargetDate(selectedDate);
    }, [selectedDate]);

    const hasChanges =
        Object.keys(reorderedEvents).length > 0 ||
        Object.keys(eventGaps).some((id) => eventGaps[id] > 0);

    const updateEventsWithCalculatedTime = async () => {
        if (!todayKiteEvents || todayKiteEvents.length === 0) {
            console.log("No events to update");
            return;
        }
        setIsUpdating(true);
        try {
            const eventsToUpdate: Array<{
                kiteEventId: string;
                calculatedTime: string;
                duration: number;
                location: "Los Lances" | "Valdevaqueros";
            }> = [];
            Object.entries(recalculatedEventsByTeacher).forEach(
                ([teacherId, teacherData]) => {
                    teacherData.events.forEach((event) => {
                        eventsToUpdate.push({
                            kiteEventId: event.id,
                            calculatedTime: event.newTime,
                            duration: event.newDuration,
                            location: event.newLocation,
                        });
                    });
                },
            );
            const result = await updateKiteEventsWithCalculatedTimeAction({
                events: eventsToUpdate,
                selectedDate: targetDate,
            });
            if (result.success) {
                toast.success("Events updated successfully!");
                setReorderedEvents({});
                setEventGaps({});
                setUpdateSuccess(true);
                setTimeout(() => setUpdateSuccess(false), 3000);
                onClose();
            } else {
                toast.error(result.error || "Failed to update events");
                throw new Error(result.error || "Failed to update events");
            }
        } catch (error: any) {
            console.error("Error updating kite events:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteAllKiteEvents = async () => {
        if (!todayKiteEvents || todayKiteEvents.length === 0) return;
        setIsDeleting(true);
        try {
            const results = await Promise.all(
                todayKiteEvents.map((event) => deleteKiteEvent(event.id))
            );
            const allSuccess = results.every((res) => res.success);
            if (allSuccess) {
                toast.success("All kite events deleted (No wind)");
                onClose();
            } else {
                toast.error("Some events could not be deleted");
            }
        } catch (error) {
            toast.error("Failed to delete kite events");
        } finally {
            setIsDeleting(false);
        }
    };

    const eventsByTeacher = useMemo(() => {
        if (!todayKiteEvents) return {};
        return todayKiteEvents.reduce(
            (acc, event) => {
                if (!acc[event.teacher.id]) {
                    acc[event.teacher.id] = {
                        teacherName: event.teacher.name,
                        events: [],
                    };
                }
                acc[event.teacher.id].events.push(event);
                return acc;
            },
            {} as Record<string, { teacherName: string; events: KiteEventData[] }>,
        );
    }, [todayKiteEvents]);

    const moveEvent = (
        teacherId: string,
        eventIndex: number,
        direction: "up" | "down",
    ) => {
        const currentEvents =
            reorderedEvents[teacherId] || eventsByTeacher[teacherId]?.events || [];
        const newEvents = [...currentEvents];
        const targetIndex = direction === "up" ? eventIndex - 1 : eventIndex + 1;
        if (targetIndex >= 0 && targetIndex < newEvents.length) {
            [newEvents[eventIndex], newEvents[targetIndex]] = [
                newEvents[targetIndex],
                newEvents[eventIndex],
            ];
            setReorderedEvents((prev) => ({
                ...prev,
                [teacherId]: newEvents,
            }));
        }
    };

    const adjustEventGap = (eventId: string, change: number) => {
        setEventGaps((prev) => {
            const currentGap = prev[eventId] || 0;
            const newGap = Math.max(0, currentGap + change);
            return {
                ...prev,
                [eventId]: newGap,
            };
        });
    };

    const recalculatedEventsByTeacher = useMemo(() => {
        if (!todayKiteEvents) return {};
        const recalculated: Record<string, { teacherName: string; events: any[] }> = {};
        Object.entries(eventsByTeacher).forEach(([teacherId, teacherData]) => {
            const { teacherName } = teacherData;
            const eventsToCalculate =
                reorderedEvents[teacherId] || teacherData.events;
            let currentEndTime = submitTime;
            const recalculatedEvents = eventsToCalculate.map((event, index) => {
                const newDuration =
                    event.students.length > 1 ? durations.multiple : durations.single;
                let calculatedTime: string;
                const gapMinutes = eventGaps[event.id] || 0;
                if (index === 0) {
                    const [hours, minutes] = submitTime.split(":").map(Number);
                    const totalMinutes = hours * 60 + minutes + gapMinutes;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    calculatedTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
                } else {
                    const [hours, minutes] = currentEndTime.split(":").map(Number);
                    const totalMinutes = hours * 60 + minutes + gapMinutes;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    calculatedTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
                }
                const [startHours, startMinutes] = calculatedTime
                    .split(":")
                    .map(Number);
                const endMinutes = startHours * 60 + startMinutes + newDuration;
                const endHours = Math.floor(endMinutes / 60);
                const endMins = endMinutes % 60;
                const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
                currentEndTime = endTime;
                return {
                    ...event,
                    newTime: calculatedTime,
                    newEndTime: endTime,
                    newDuration,
                    newLocation: location,
                    hasConflicts: false,
                    conflicts: [],
                };
            });
            recalculated[teacherId] = {
                teacherName,
                events: recalculatedEvents,
            };
        });
        return recalculated;
    }, [eventsByTeacher, submitTime, location, durations, todayKiteEvents, reorderedEvents, eventGaps]);

    const hasActualUpdates = useMemo(() => {
        if (!todayKiteEvents || todayKiteEvents.length === 0) return false;
        for (const [teacherId, teacherData] of Object.entries(eventsByTeacher)) {
            const originalEvents = teacherData.events;
            const recalculatedData = recalculatedEventsByTeacher[teacherId];
            const recalculatedEvents = recalculatedData?.events || [];
            for (let i = 0; i < originalEvents.length; i++) {
                const original = originalEvents[i];
                const recalculated = recalculatedEvents[i];
                if (!recalculated) continue;
                const originalTime = new Date(original.date).toLocaleTimeString(
                    "es-ES",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Europe/Madrid",
                    },
                );
                const originalDuration = original.duration;
                const newDuration = recalculated.newDuration;
                const originalLocation = original.location;
                const newLocation = recalculated.newLocation;
                const originalDate = new Date(original.date).toDateString();
                const newDate = targetDate.toDateString();
                if (
                    originalTime !== recalculated.newTime ||
                    originalDuration !== newDuration ||
                    originalLocation !== newLocation ||
                    originalDate !== newDate
                ) {
                    return true;
                }
            }
        }
        return false;
    }, [todayKiteEvents, eventsByTeacher, recalculatedEventsByTeacher, targetDate]);

    const eventCount = todayKiteEvents?.length || 0;
    if (eventCount === 0) {
        return (
            <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-sm font-medium mb-3">
                    Selected Kite Events by Teacher:
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No events scheduled for today
                </p>
            </div>
        );
    }
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium">
                        Edit Today&apos;s Kite Events by Teacher:
                    </h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Currently: {selectedDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Reschedule to:
                        </span>
                        <input
                            type="date"
                            value={targetDate.toISOString().split("T")[0]}
                            onChange={(e) => setTargetDate(new Date(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {updateSuccess && (
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            ✅ Updated successfully!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={updateEventsWithCalculatedTime}
                        disabled={
                            isUpdating ||
                            eventCount === 0 ||
                            (!hasChanges && !hasActualUpdates)
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isUpdating ||
                            eventCount === 0 ||
                            (!hasChanges && !hasActualUpdates)
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : hasChanges
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                        title={
                            !hasChanges && !hasActualUpdates
                                ? "No changes to save - events are already up to date"
                                : hasChanges
                                    ? "Save reordered events"
                                    : "Update all events with new times and settings"
                        }
                    >
                        {isUpdating
                            ? "Updating..."
                            : !hasChanges && !hasActualUpdates
                                ? "No Changes"
                                : hasChanges
                                    ? "Save Changes"
                                    : "Update All Events"}
                    </button>
                    <button
                        type="button"
                        onClick={deleteAllKiteEvents}
                        disabled={isDeleting || eventCount === 0}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDeleting || eventCount === 0
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                        title="Delete all kite events (No wind)"
                    >
                        {isDeleting ? "Deleting..." : "No wind (Delete All)"}
                    </button>
                </div>
            </div>
            {Object.entries(eventsByTeacher).map(([teacherId, teacherData]) => {
                const { teacherName } = teacherData;
                const originalEvents = teacherData.events;
                const recalculatedData = recalculatedEventsByTeacher[teacherId];
                const recalculatedEvents = recalculatedData?.events || [];
                if (originalEvents.length === 0 && recalculatedEvents.length === 0) {
                    return null;
                }
                const isExpanded = expandedTeachers[teacherId] ?? true;
                return (
                    <div
                        key={teacherId}
                        className="mb-6 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Editing {originalEvents.length} event
                                {originalEvents.length !== 1 ? "s" : ""} for teacher: {" "}
                                <span className="text-blue-600 dark:text-blue-400">
                                    {teacherName}
                                </span>
                            </h5>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {teacherId.slice(-6)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedTeachers((prev) => ({
                                            ...prev,
                                            [teacherId]: !isExpanded,
                                        }))
                                    }
                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                    title={isExpanded ? "Collapse" : "Expand"}
                                >
                                    {isExpanded ? "▲" : "▼"}
                                </button>
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Original Events */}
                                <div className="space-y-2">
                                    <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Schedule
                                    </h6>
                                    {originalEvents.map((event, index) => (
                                        <div
                                            key={`original-${event.id}`}
                                            className="p-3 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                                        {event.id.slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                    <div>
                                                        <strong>Students:</strong>{" "}
                                                        {event.students.map((s) => s.name).join(", ")}
                                                    </div>
                                                    <div>
                                                        <strong>Time:</strong> {event.time}
                                                    </div>
                                                    <div>
                                                        <strong>Location:</strong> {event.location}
                                                    </div>
                                                    <div>
                                                        <strong>Duration:</strong>{" "}
                                                        {formatDuration(event.duration)}
                                                    </div>
                                                    <div>
                                                        <strong>Date:</strong>{" "}
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Recalculated Events */}
                                <div className="space-y-2">
                                    <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Schedule
                                    </h6>
                                    {recalculatedEvents.map((event, index) => (
                                        <div
                                            key={`new-${event.id}`}
                                            className="p-3 rounded border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                                        >
                                            <div className="flex items-start gap-2">
                                                {/* Gap Controls */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        Gap:
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => adjustEventGap(event.id, 60)}
                                                            className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                                                            title="Add 1 hour gap"
                                                        >
                                                            +1h
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => adjustEventGap(event.id, 30)}
                                                            className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                                                            title="Add 30 minutes gap"
                                                        >
                                                            +30m
                                                        </button>
                                                        {(eventGaps[event.id] || 0) > 0 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => adjustEventGap(event.id, -30)}
                                                                    className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300"
                                                                    title="Remove 30 minutes gap"
                                                                >
                                                                    -30m
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => adjustEventGap(event.id, -60)}
                                                                    className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300"
                                                                    title="Remove 1 hour gap"
                                                                    disabled={(eventGaps[event.id] || 0) < 60}
                                                                >
                                                                    -1h
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {(eventGaps[event.id] || 0) > 0 && (
                                                        <div className="text-center text-orange-600 dark:text-orange-400 font-medium border p-1 rounded">
                                                            +{Math.floor((eventGaps[event.id] || 0) / 60)}h
                                                            {(eventGaps[event.id] || 0) % 60 > 0
                                                                ? ` ${(eventGaps[event.id] || 0) % 60}m`
                                                                : ""}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Reorder Controls */}
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveEvent(teacherId, index, "up")}
                                                        disabled={index === 0}
                                                        className={`p-1 rounded text-xs ${index === 0
                                                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                            }`}
                                                        title="Move up"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveEvent(teacherId, index, "down")}
                                                        disabled={index === recalculatedEvents.length - 1}
                                                        className={`p-1 rounded text-xs ${index === recalculatedEvents.length - 1
                                                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                            }`}
                                                        title="Move down"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                                {/* Event Content */}
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1 py-0.5 rounded">
                                                            {event.id.slice(-4)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                        <div>
                                                            <strong>Students:</strong>{" "}
                                                            {event.students.map((s: any) => s.name).join(", ")}
                                                        </div>
                                                        <div>
                                                            <strong>Time:</strong> {event.newTime} - {" "}
                                                            {event.newEndTime}
                                                        </div>
                                                        <div>
                                                            <strong>Location:</strong> {event.newLocation}
                                                        </div>
                                                        <div>
                                                            <strong>Duration:</strong>{" "}
                                                            {formatDuration(event.newDuration)}
                                                        </div>
                                                        <div>
                                                            <strong>Date:</strong>{" "}
                                                            {targetDate.toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default UpdateKiteEventsDisplay; 