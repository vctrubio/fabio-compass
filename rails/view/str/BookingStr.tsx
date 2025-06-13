import React from 'react';
import { AStr } from './AStr';
import { FormatDateRange } from '@/components/formatters';
import { DatePickerRange } from '@/rails/types';
import { ENTITY_CONFIGS } from '@/config/entities';


/*

🟢 Green if currently active
🔵 Blue if future booking
⚫ Gray if past booking


*/
export interface BookingStrProps extends React.HTMLAttributes<HTMLDivElement> {
    dateRange: DatePickerRange;
}

export function BookingStr({ dateRange, ...props }: BookingStrProps) {
    const BookingIcon = ENTITY_CONFIGS.bookings.icon;
    
    return (
        <AStr
            icon={<BookingIcon className="w-4 h-4" />}
            {...props}
        >
            <FormatDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </AStr>
    );
}
