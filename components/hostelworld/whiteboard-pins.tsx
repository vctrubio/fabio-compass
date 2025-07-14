"use client";

import { useState, useMemo, useEffect } from "react";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingCard } from "@/rails/view/card/BookingCard";
import { KiteEventData } from "./types";
import { Eye, EyeOff } from "lucide-react";
import { BookingIcon } from "@/assets/svg";

// --- TYPES ---
type FilterType = 'all' | 'available' | 'onboard' | 'offboard' | 'no-lessons' | 'cancelled' | 'completed' | 'overbooking';

// --- STYLES ---
const BOOKING_HEADER_CLASSES = {
    HAS_KITE_EVENTS_TODAY: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    HAS_LESSONS_NO_KITE_EVENTS: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    PROGRESS_NOT_COMPLETED: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
    DEFAULT: "bg-gray-50 dark:bg-gray-800"
} as const;

export function WhiteboardPins({ bookingsData, selectedDate, todayKiteEvents = [] }: { bookingsData: DrizzleData<BookingType>[]; selectedDate?: Date; todayKiteEvents?: KiteEventData[]; }) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isSimpleView, setIsSimpleView] = useState(false);

    // LocalStorage sync
    useEffect(() => {
        const savedFilter = localStorage.getItem('whiteboard-pins-filter');
        if (savedFilter && ['all', 'available', 'onboard', 'offboard', 'no-lessons', 'cancelled', 'completed', 'overbooking'].includes(savedFilter)) {
            setActiveFilter(savedFilter as FilterType);
        }
        const savedSimpleView = localStorage.getItem('whiteboard-pins-simple-view');
        if (savedSimpleView !== null) setIsSimpleView(savedSimpleView === 'true');
    }, []);
    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        localStorage.setItem('whiteboard-pins-filter', filter);
    };
    const toggleSimpleView = () => {
        const newSimpleView = !isSimpleView;
        setIsSimpleView(newSimpleView);
        localStorage.setItem('whiteboard-pins-simple-view', newSimpleView.toString());
    };

    // --- HELPERS (inlined) ---
    const getBookingHeaderClass = (booking: DrizzleData<BookingType>, selectedDate?: Date) => {
        const lessons = (booking.relations as any)?.lessons || [];
        const targetDate = selectedDate || new Date();
        const hasKiteEventsToday = lessons.some((lesson: any) =>
            (lesson.kiteEvents || []).some((kiteEvent: any) => {
                const d1 = new Date(kiteEvent.date), d2 = targetDate;
                return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
            })
        );
        if (hasKiteEventsToday) return BOOKING_HEADER_CLASSES.HAS_KITE_EVENTS_TODAY;
        if (lessons.length > 0) return BOOKING_HEADER_CLASSES.HAS_LESSONS_NO_KITE_EVENTS;
        return BOOKING_HEADER_CLASSES.DEFAULT;
    };
    const getTotalKiteMinutes = (booking: DrizzleData<BookingType>) => {
        const lessons = (booking.relations as any)?.lessons || [];
        let total = 0;
        lessons.forEach((lesson: any) => {
            (lesson.kiteEvents || []).forEach((event: any) => {
                if (event.duration && typeof event.duration === 'number') total += event.duration;
            });
        });
        return total;
    };
    const getPackageDuration = (booking: DrizzleData<BookingType>) => {
        const pkg = (booking.relations as any)?.package;
        return pkg?.duration || 0;
    };

    // --- Kite Events Today Set ---
    const bookingsWithKiteEventsToday = useMemo(() => {
        const bookingIds = new Set<string>();
        todayKiteEvents.forEach(event => {
            bookingsData.forEach(booking => {
                const lessons = (booking.relations as any)?.lessons || [];
                if (lessons.some((lesson: any) => lesson.id === event.lesson_id)) {
                    bookingIds.add(booking.model.id);
                }
            });
        });
        return bookingIds;
    }, [todayKiteEvents, bookingsData]);

    // --- Filtered Bookings ---
    const filteredBookings = useMemo(() => bookingsData.filter(booking => {
        const lessons = (booking.relations as any)?.lessons || [];
        switch (activeFilter) {
            case 'all': return true;
            case 'available': {
                const totalMinutesAvailable = getTotalKiteMinutes(booking);
                const packageDurationAvailable = getPackageDuration(booking);
                const hasKiteEventsToday = bookingsWithKiteEventsToday.has(booking.model.id);
                const hasCancelledLessons = lessons.some((lesson: any) => lesson.status === 'cancelled' || lesson.status === 'delegated');
                return (lessons.length === 0 || (!hasKiteEventsToday && !(packageDurationAvailable > 0 && totalMinutesAvailable >= packageDurationAvailable) && !hasCancelledLessons));
            }
            case 'onboard': return bookingsWithKiteEventsToday.has(booking.model.id);
            case 'no-lessons': return lessons.length === 0;
            case 'cancelled': return lessons.some((lesson: any) => lesson.status === 'cancelled' || lesson.status === 'delegated');
            case 'completed': {
                const totalMinutes = getTotalKiteMinutes(booking);
                const packageDuration = getPackageDuration(booking);
                return packageDuration > 0 && totalMinutes >= packageDuration;
            }
            case 'overbooking': {
                const overTotalMinutes = getTotalKiteMinutes(booking);
                const overPackageDuration = getPackageDuration(booking);
                return overPackageDuration > 0 && overTotalMinutes > overPackageDuration;
            }
            default: return true;
        }
    }), [bookingsData, activeFilter, bookingsWithKiteEventsToday]);

    // --- Status Breakdown ---
    const statusBreakdown = useMemo(() => {
        const breakdown = {
            waiting: { count: 0, color: 'bg-orange-500', label: 'Available' },
            onboard: { count: 0, color: 'bg-green-500', label: 'OnBoard' },
            noLessons: { count: 0, color: 'bg-yellow-500', label: 'No Lessons' },
            cancelled: { count: 0, color: 'bg-red-500', label: 'Cancelled' },
            completed: { count: 0, color: 'bg-blue-500', label: 'Completed' },
            overbooking: { count: 0, color: 'bg-orange-500', label: 'Over Booking' }
        };
        bookingsData.forEach(booking => {
            const lessons = (booking.relations as any)?.lessons || [];
            const totalMinutes = getTotalKiteMinutes(booking);
            const packageDuration = getPackageDuration(booking);
            const hasKiteEventsToday = bookingsWithKiteEventsToday.has(booking.model.id);
            const hasCancelledLessons = lessons.some((lesson: any) => lesson.status === 'cancelled' || lesson.status === 'delegated');
            if (hasCancelledLessons) breakdown.cancelled.count++;
            else if (lessons.length === 0) breakdown.noLessons.count++;
            else if (hasKiteEventsToday) breakdown.onboard.count++;
            else if (packageDuration > 0 && totalMinutes > packageDuration) breakdown.overbooking.count++;
            else if (packageDuration > 0 && totalMinutes >= packageDuration) breakdown.completed.count++;
            else breakdown.waiting.count++;
        });
        return breakdown;
    }, [bookingsData, bookingsWithKiteEventsToday]);

    // --- Filter Buttons ---
    const filterButtons = [
        { key: 'all', label: 'All', count: bookingsData.length, color: '', desc: 'All bookings in the system' },
        { key: 'available', label: 'Available', count: statusBreakdown.waiting.count + statusBreakdown.noLessons.count, color: 'bg-orange-500', desc: 'Lessons looking to Kite or needing an instructor' },
        { key: 'onboard', label: 'OnBoard', count: statusBreakdown.onboard.count, color: 'bg-green-500', desc: 'Lessons that are kiting today' },
        { key: 'no-lessons', label: 'No Lessons', count: statusBreakdown.noLessons.count, color: 'bg-yellow-500', desc: 'Lessons looking for an instructor' },
        { key: 'cancelled', label: 'Cancelled', count: statusBreakdown.cancelled.count, color: 'bg-red-500', desc: 'Cancelled or delegated lessons' },
        { key: 'completed', label: 'Completed', count: statusBreakdown.completed.count, color: 'bg-blue-500', desc: 'Completed bookings, but not paid' },
        { key: 'overbooking', label: 'Over Booking', count: statusBreakdown.overbooking.count, color: 'bg-orange-500', desc: 'Lessons with too many hours, and too little money' }
    ];

    if (bookingsData.length === 0) {
        return (
            <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
                <div className="text-center text-muted-foreground">No bookings to display</div>
            </div>
        );
    }

    // --- RENDER ---
    return (
        <div className="bg-card rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
            {/* PinsHeader */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <BookingIcon className="w-6 h-6 text-primary" />
                    <h3 className="font-medium text-primary">
                        {activeFilter === 'all' ? 'All Bookings' : filterButtons.find(f => f.key === activeFilter)?.desc}
                        <span className="ml-2 text-sm text-muted-foreground">({filteredBookings.length})</span>
                    </h3>
                    <button
                        onClick={toggleSimpleView}
                        className="p-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary transform hover:scale-110 hover:bg-muted/20"
                        title={isSimpleView ? 'Show filters' : 'Hide filters'}
                    >
                        {isSimpleView ? <EyeOff size={26} /> : <Eye size={26} />}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <div className={`transition-all duration-500 ease-in-out ${isSimpleView ? 'max-h-0 opacity-0 translate-y-[-10px]' : 'max-h-[2000px] opacity-100 translate-y-0'} overflow-hidden`}>
                <div className="px-4 pb-4">
                    {/* Status Overview */}
                    <div className="mb-4">
                        <div className="text-sm font-medium mb-3 text-muted-foreground transition-opacity duration-300 delay-100">
                            Status Overview ({bookingsData.length} total)
                        </div>
                        {/* StatusBar */}
                        <div className="flex rounded-lg overflow-hidden h-6 mb-3 bg-gray-300 dark:bg-gray-600 border transition-transform duration-300 delay-150">
                            {Object.entries(statusBreakdown).map(([key, status]) => {
                                const percentage = bookingsData.length > 0 ? (status.count / bookingsData.length) * 100 : 0;
                                const filterKey = key === 'waiting' ? 'available' : key === 'noLessons' ? 'no-lessons' : key;
                                const isActive = activeFilter === filterKey;
                                return status.count > 0 ? (
                                    <button
                                        key={key}
                                        onClick={() => handleFilterChange(filterKey as FilterType)}
                                        className={`transition-all duration-200 relative group hover:opacity-80 ${isActive ? 'bg-primary border-2 border-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                                        style={{ width: `${percentage}%`, boxSizing: 'border-box' }}
                                        title={`${status.label}: ${status.count} (${percentage.toFixed(1)}%)`}
                                    >
                                        {isActive && percentage > 10 && (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground drop-shadow">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        )}
                                    </button>
                                ) : null;
                            })}
                        </div>
                        {/* FilterButtons */}
                        <div className="flex flex-wrap gap-2 transition-transform duration-300 delay-200">
                            {filterButtons.map(filter => {
                                const statusKey = filter.key === 'available' ? 'waiting' : filter.key === 'no-lessons' ? 'noLessons' : filter.key;
                                const statusData = (statusBreakdown as any)[statusKey];
                                return (
                                    <button
                                        key={filter.key}
                                        onClick={() => handleFilterChange(filter.key as FilterType)}
                                        title={filter.desc}
                                        className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 border-2 transform hover:scale-105 ${activeFilter === filter.key ? `bg-primary text-primary-foreground shadow-sm ${filter.color?.replace('bg-', 'border-').replace('500', '500') || 'border-primary'}` : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent'}`}
                                    >
                                        {filter.color && <div className={`w-2 h-2 rounded-full ${filter.color}`} />}
                                        <span>{filter.label}</span>
                                        <span className="text-xs opacity-75">{(statusData?.count || filter.count) ? `(${statusData?.count || filter.count})` : ''}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* BookingsDisplay */}
                    <div className="transition-opacity duration-300 delay-250">
                        {filteredBookings.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No bookings found for -{filterButtons.find(f => f.key === activeFilter)?.label}- filter
                            </div>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto pr-1">
                                <div className="flex flex-wrap gap-3">
                                    {filteredBookings.map(booking => (
                                        <BookingCard
                                            key={booking.model.id}
                                            booking={booking}
                                            headerClassName={getBookingHeaderClass(booking, selectedDate)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
