"use client";

import { useState, useMemo, useEffect } from "react";
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingCard } from "@/rails/view/card/BookingCard";
import { WhiteboardStyles } from "./whiteboard-classes";
import { KiteEventData } from "./types";
import { Eye, EyeOff } from "lucide-react";
import { BookingIcon } from "@/assets/svg";

type FilterType = 'all' | 'available' | 'onboard' | 'offboard' | 'no-lessons' | 'cancelled' | 'completed' | 'overbooking';

interface WhiteboardPinsProps {
    bookingsData: DrizzleData<BookingType>[];
    selectedDate?: Date;
    todayKiteEvents?: KiteEventData[];
}

interface StatusBreakdown {
    waiting: StatusData;
    onboard: StatusData;
    noLessons: StatusData;
    cancelled: StatusData;
    completed: StatusData;
    overbooking: StatusData;
}

interface StatusData {
    count: number;
    color: string;
    label: string;
}

interface FilterButton {
    key: FilterType;
    label: string;
    count: number;
    color: string;
    desc: string;
}

interface PinsHeaderProps {
    activeFilter: FilterType;
    filteredCount: number;
    isSimpleView: boolean;
    onToggleSimpleView: () => void;
    filterButtons: FilterButton[];
}

interface FilterInterfaceProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    filterButtons: FilterButton[];
    statusBreakdown: StatusBreakdown;
    totalBookings: number;
}

interface StatusBarProps {
    statusBreakdown: StatusBreakdown;
    totalBookings: number;
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

interface FilterButtonsProps {
    filterButtons: FilterButton[];
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    statusBreakdown: StatusBreakdown;
}

interface BookingsDisplayProps {
    filteredBookings: DrizzleData<BookingType>[];
    selectedDate?: Date;
    activeFilter: FilterType;
    filterButtons: FilterButton[];
}

// Pins Header Component
const PinsHeader = ({ 
    activeFilter, 
    filteredCount, 
    isSimpleView, 
    onToggleSimpleView, 
    filterButtons 
}: PinsHeaderProps) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <BookingIcon className="w-6 h-6 text-primary" />
            <h3 className="font-medium text-primary">
                {activeFilter === 'all' ? 'All Bookings' : filterButtons.find(f => f.key === activeFilter)?.desc}
                <span className="ml-2 text-sm text-muted-foreground">({filteredCount})</span>
            </h3>
            <button
                onClick={onToggleSimpleView}
                className="p-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary transform hover:scale-110 hover:bg-muted/20"
                title={isSimpleView ? 'Show filters' : 'Hide filters'}
            >
                {isSimpleView ? <EyeOff size={26} /> : <Eye size={26} />}
            </button>
        </div>
    </div>
);

// Status Bar Component
const StatusBar = ({ 
    statusBreakdown, 
    totalBookings, 
    activeFilter, 
    onFilterChange 
}: StatusBarProps) => (
    <div className="flex rounded-lg overflow-hidden h-6 mb-3 bg-gray-300 dark:bg-gray-600 border transition-transform duration-300 delay-150">
        {Object.entries(statusBreakdown).map(([key, status]) => {
            const percentage = totalBookings > 0 ? (status.count / totalBookings) * 100 : 0;
            const filterKey = key === 'waiting' ? 'available' :
                key === 'noLessons' ? 'no-lessons' :
                    key;
            const isActive = activeFilter === filterKey;
            return status.count > 0 ? (
                <button
                    key={key}
                    onClick={() => onFilterChange(filterKey as FilterType)}
                    className={`transition-all duration-200 relative group hover:opacity-80 ${
                        isActive
                            ? 'bg-primary border-2 border-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                    }`}
                    style={{
                        width: `${percentage}%`,
                        boxSizing: 'border-box'
                    }}
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
);

// Filter Buttons Component
const FilterButtons = ({ 
    filterButtons, 
    activeFilter, 
    onFilterChange, 
    statusBreakdown 
}: FilterButtonsProps) => (
    <div className="flex flex-wrap gap-2 transition-transform duration-300 delay-200">
        {filterButtons.map(filter => {
            const statusKey = filter.key === 'available' ? 'waiting' :
                filter.key === 'no-lessons' ? 'noLessons' :
                    filter.key === 'onboard' ? 'onboard' :
                        filter.key === 'cancelled' ? 'cancelled' :
                            filter.key === 'completed' ? 'completed' :
                                filter.key === 'overbooking' ? 'overbooking' :
                                    filter.key;
            const statusData = statusBreakdown[statusKey as keyof typeof statusBreakdown];

            return (
                <button
                    key={filter.key}
                    onClick={() => onFilterChange(filter.key)}
                    title={filter.desc}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 border-2 transform hover:scale-105 ${
                        activeFilter === filter.key
                            ? `bg-primary text-primary-foreground shadow-sm ${filter.color?.replace('bg-', 'border-').replace('500', '500') || 'border-primary'}`
                            : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                    {/* Color indicator */}
                    {filter.color && (
                        <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                    )}
                    <span>{filter.label}</span>
                    <span className="text-xs opacity-75">
                        ({statusData?.count || filter.count})
                    </span>
                </button>
            );
        })}
    </div>
);

// Filter Interface Component
const FilterInterface = ({ 
    activeFilter, 
    onFilterChange, 
    filterButtons, 
    statusBreakdown, 
    totalBookings 
}: FilterInterfaceProps) => (
    <div className="mb-4">
        <div className="text-sm font-medium mb-3 text-muted-foreground transition-opacity duration-300 delay-100">
            Status Overview ({totalBookings} total)
        </div>

        <StatusBar
            statusBreakdown={statusBreakdown}
            totalBookings={totalBookings}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
        />

        <FilterButtons
            filterButtons={filterButtons}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            statusBreakdown={statusBreakdown}
        />
    </div>
);

// Bookings Display Component
const BookingsDisplay = ({ 
    filteredBookings, 
    selectedDate, 
    activeFilter, 
    filterButtons 
}: BookingsDisplayProps) => (
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
                            headerClassName={WhiteboardStyles.getBookingHeaderClass(
                                booking,
                                selectedDate,
                            )}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
);

export function WhiteboardPins({ bookingsData, selectedDate, todayKiteEvents = [] }: WhiteboardPinsProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isSimpleView, setIsSimpleView] = useState(false);

    // Load filter from localStorage on mount
    useEffect(() => {
        const savedFilter = localStorage.getItem('whiteboard-pins-filter');
        if (savedFilter && ['all', 'available', 'onboard', 'offboard', 'no-lessons', 'cancelled', 'completed', 'overbooking'].includes(savedFilter)) {
            setActiveFilter(savedFilter as FilterType);
        }

        // Load simple view state
        const savedSimpleView = localStorage.getItem('whiteboard-pins-simple-view');
        if (savedSimpleView !== null) {
            setIsSimpleView(savedSimpleView === 'true');
        }
    }, []);

    // Save filter to localStorage when it changes
    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        localStorage.setItem('whiteboard-pins-filter', filter);
    };

    // Toggle simple view and save to localStorage
    const toggleSimpleView = () => {
        const newSimpleView = !isSimpleView;
        setIsSimpleView(newSimpleView);
        localStorage.setItem('whiteboard-pins-simple-view', newSimpleView.toString());
    };

    // Create a set of booking IDs that have kite events today for efficient lookup
    const bookingsWithKiteEventsToday = useMemo(() => {
        const bookingIds = new Set<string>();
        todayKiteEvents.forEach(event => {
            // Find the booking for this lesson
            bookingsData.forEach(booking => {
                const relations = booking.relations as { lessons?: Array<{ id: string; kiteEvents?: Array<{ duration: number }> }> };
                const lessons = relations?.lessons || [];
                if (lessons.some((lesson) => lesson.id === event.lesson_id)) {
                    bookingIds.add(booking.model.id);
                }
            });
        });
        return bookingIds;
    }, [todayKiteEvents, bookingsData]);

    // Helper function to calculate total kite minutes for a booking
    const getTotalKiteMinutes = useMemo(() => 
        (booking: DrizzleData<BookingType>): number => {
            const relations = booking.relations as { lessons?: Array<{ kiteEvents?: Array<{ duration: number }> }> };
            const lessons = relations?.lessons || [];
            let totalMinutes = 0;

            lessons.forEach((lesson) => {
                const kiteEvents = lesson.kiteEvents || [];
                kiteEvents.forEach((event) => {
                    if (event.duration && typeof event.duration === 'number') {
                        totalMinutes += event.duration;
                    }
                });
            });

            return totalMinutes;
        }, 
    []);

    // Helper function to get package duration for a booking
    const getPackageDuration = useMemo(() =>
        (booking: DrizzleData<BookingType>): number => {
            const relations = booking.relations as { package?: { duration: number } };
            const packageData = relations?.package;
            return packageData?.duration || 0;
        },
    []);

    // Filter bookings based on lesson status
    const filteredBookings = useMemo(() => {
        return bookingsData.filter(booking => {
            const relations = booking.relations as { lessons?: Array<{ status: string }> };
            const lessons = relations?.lessons || [];

            switch (activeFilter) {
                case 'all':
                    return true;

                case 'available':
                    // Show bookings that are waiting (have lessons OR no lessons, no events today, not completed)
                    const totalMinutesAvailable = getTotalKiteMinutes(booking);
                    const packageDurationAvailable = getPackageDuration(booking);
                    const hasKiteEventsToday = bookingsWithKiteEventsToday.has(booking.model.id);
                    const hasCancelledLessons = lessons.some((lesson) =>
                        lesson.status === 'cancelled' || lesson.status === 'delegated'
                    );

                    // Include bookings with no lessons OR bookings with lessons that are not kiting today, not completed/over, not cancelled
                    return (lessons.length === 0 || 
                        (lessons.length > 0 &&
                         !hasKiteEventsToday &&
                         !(packageDurationAvailable > 0 && totalMinutesAvailable >= packageDurationAvailable) &&
                         !hasCancelledLessons));

                case 'onboard':
                    // Show bookings that have kite events today
                    return bookingsWithKiteEventsToday.has(booking.model.id);

                case 'no-lessons':
                    // Show bookings with no lessons at all
                    return lessons.length === 0;

                case 'cancelled':
                    // Show bookings with lessons that are cancelled or delegated
                    return lessons.some((lesson) =>
                        lesson.status === 'cancelled' || lesson.status === 'delegated'
                    );

                case 'completed':
                    // Show bookings where total kite minutes >= package duration
                    const totalMinutes = getTotalKiteMinutes(booking);
                    const packageDuration = getPackageDuration(booking);
                    return packageDuration > 0 && totalMinutes >= packageDuration;

                case 'overbooking':
                    // Show bookings where total kite minutes > package duration (not equal)
                    const overTotalMinutes = getTotalKiteMinutes(booking);
                    const overPackageDuration = getPackageDuration(booking);
                    return overPackageDuration > 0 && overTotalMinutes > overPackageDuration;

                default:
                    return true;
            }
        });
    }, [bookingsData, activeFilter, bookingsWithKiteEventsToday, getTotalKiteMinutes, getPackageDuration]);

    // Calculate status breakdown for visualization (ordered to match filter buttons)
    const statusBreakdown = useMemo(() => {
        const breakdown: StatusBreakdown = {
            waiting: { count: 0, color: 'bg-orange-500', label: 'Available' },
            onboard: { count: 0, color: 'bg-green-500', label: 'OnBoard' },
            noLessons: { count: 0, color: 'bg-yellow-500', label: 'No Lessons' },
            cancelled: { count: 0, color: 'bg-red-500', label: 'Cancelled' },
            completed: { count: 0, color: 'bg-blue-500', label: 'Completed' },
            overbooking: { count: 0, color: 'bg-orange-500', label: 'Over Booking' }
        };

        bookingsData.forEach(booking => {
            const relations = booking.relations as { lessons?: Array<{ status: string }> };
            const lessons = relations?.lessons || [];
            const totalMinutes = getTotalKiteMinutes(booking);
            const packageDuration = getPackageDuration(booking);
            const hasKiteEventsToday = bookingsWithKiteEventsToday.has(booking.model.id);
            const hasCancelledLessons = lessons.some((lesson) =>
                lesson.status === 'cancelled' || lesson.status === 'delegated'
            );

            // Mutually exclusive categories (priority: onboard status first, then completion status)
            if (hasCancelledLessons) {
                breakdown.cancelled.count++;
            } else if (lessons.length === 0) {
                breakdown.noLessons.count++;
            } else if (hasKiteEventsToday) {
                // If they're kiting today, they're onboard regardless of completion status
                breakdown.onboard.count++;
            } else if (packageDuration > 0 && totalMinutes > packageDuration) {
                breakdown.overbooking.count++;
            } else if (packageDuration > 0 && totalMinutes >= packageDuration) {
                breakdown.completed.count++;
            } else {
                breakdown.waiting.count++;
            }
        });

        return breakdown;
    }, [bookingsData, bookingsWithKiteEventsToday, getTotalKiteMinutes, getPackageDuration]);

    const filterButtons: FilterButton[] = [
        { key: 'all' as FilterType, label: 'All', count: bookingsData.length, color: '', desc: 'All bookings in the system' },
        {
            key: 'available' as FilterType,
            label: 'Available',
            count: statusBreakdown.waiting.count + statusBreakdown.noLessons.count,
            color: 'bg-orange-500',
            desc: 'Lessons looking to Kite or needing an instructor'
        },
        {
            key: 'onboard' as FilterType,
            label: 'OnBoard',
            count: statusBreakdown.onboard.count,
            color: 'bg-green-500',
            desc: 'Lessons that are kiting today'
        },
        {
            key: 'no-lessons' as FilterType,
            label: 'No Lessons',
            count: statusBreakdown.noLessons.count,
            color: 'bg-yellow-500',
            desc: 'Lessons looking for an instructor'
        },
        {
            key: 'cancelled' as FilterType,
            label: 'Cancelled',
            count: statusBreakdown.cancelled.count,
            color: 'bg-red-500',
            desc: 'Cancelled or delegated lessons'
        },
        {
            key: 'completed' as FilterType,
            label: 'Completed',
            count: statusBreakdown.completed.count,
            color: 'bg-blue-500',
            desc: 'Completed bookings, but not paid'
        },
        {
            key: 'overbooking' as FilterType,
            label: 'Over Booking',
            count: statusBreakdown.overbooking.count,
            color: 'bg-orange-500',
            desc: 'Lessons with too many hours, and too little money'
        }
    ];

    if (bookingsData.length === 0) {
        return (
            <div className="p-4 bg-card rounded-lg border dark:border-gray-800 shadow-sm">
                <div className="text-center text-muted-foreground">
                    No bookings to display
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
            <PinsHeader
                activeFilter={activeFilter}
                filteredCount={filteredBookings.length}
                isSimpleView={isSimpleView}
                onToggleSimpleView={toggleSimpleView}
                filterButtons={filterButtons}
            />

            {/* Main Content - Animated Container */}
            <div className={`transition-all duration-500 ease-in-out ${
                isSimpleView 
                    ? 'max-h-0 opacity-0 translate-y-[-10px]' 
                    : 'max-h-[2000px] opacity-100 translate-y-0'
            } overflow-hidden`}>
                <div className="px-4 pb-4">
                    <FilterInterface
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                        filterButtons={filterButtons}
                        statusBreakdown={statusBreakdown}
                        totalBookings={bookingsData.length}
                    />

                    <BookingsDisplay
                        filteredBookings={filteredBookings}
                        selectedDate={selectedDate}
                        activeFilter={activeFilter}
                        filterButtons={filterButtons}
                    />
                </div>
            </div>
        </div>
    );
}
