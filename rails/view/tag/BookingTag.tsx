import React from 'react';
import { ATag } from './ATag';
import { FormatDateRange } from '@/components/formatters';
import { DatePickerRange } from '@/rails/types';
import { ENTITY_CONFIGS } from '@/config/entities';


/*

🟢 Green if currently active
🔵 Blue if future booking
⚫ Gray if past booking


*/
export interface BookingTagProps extends React.HTMLAttributes<HTMLDivElement> {
    dateRange: DatePickerRange;
}

export function BookingTag({ dateRange, ...props }: BookingTagProps) {
    const BookingIcon = ENTITY_CONFIGS.bookings.icon;
    
    return (
        <ATag
            icon={<BookingIcon className="w-4 h-4" />}
            {...props}
        >
            <FormatDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </ATag>
    );
}