import React from 'react';
import { AStr } from './AStr';
import { FormatDateRange } from '@/components/formatters';
import { DatePickerRange } from '@/rails/types';
import { ENTITY_CONFIGS } from '@/config/entities';
import { ProgressBar } from '@/components/formatters';

/*

🟢 Green if currently active
🔵 Blue if future booking
⚫ Gray if past booking


*/
export interface BookingStrProps extends React.HTMLAttributes<HTMLDivElement> {
    dateRange: DatePickerRange;
    usedMinutes?: number;
    totalMinutes?: number;
}

export function BookingStr({ dateRange, usedMinutes, totalMinutes, className, ...props }: BookingStrProps) {
    const BookingIcon = ENTITY_CONFIGS.bookings.icon;

    // If we have progress to show, use a flex container; otherwise, just use AStr directly
    if (totalMinutes && totalMinutes > 0) {
        return (
            <div
                className={`inline-flex items-center rounded-md border border-border bg-background ${className || ''}`}
                {...props}
            >
                <AStr
                    icon={<BookingIcon className="w-4 h-4" />}
                    className="border-none"
                >
                    <FormatDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} />
                </AStr>

                <div className="flex-grow pr-3 min-w-[100px] max-w-[180px]">
                    <ProgressBar
                        usedMinutes={usedMinutes || 0}
                        totalMinutes={totalMinutes}
                    />
                </div>
            </div>
        );
    }

    // For bookings without progress, just use the AStr directly
    return (
        <AStr
            icon={<BookingIcon className="w-4 h-4" />}
            className={className}
            {...props}
        >
            <FormatDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </AStr>
    );
}
