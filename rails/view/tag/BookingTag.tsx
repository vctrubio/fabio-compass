import React from 'react';
import { ATag } from './ATag';
import { FormatDateRange } from '@/components/formatters';
import { ENTITY_CONFIGS } from '@/config/entities';
import { BookingType } from "@/rails/model/BookingModel";


export interface BookingTagProps {
    booking: BookingType;
}

export function BookingTag({ booking }: BookingTagProps) {
    const BookingIcon = ENTITY_CONFIGS.bookings.icon;

    return (
        <ATag
            icon={<BookingIcon className="w-4 h-4" />}
            className="border-0"
        >
            <FormatDateRange
                startDate={booking.date_start}
                endDate={booking.date_end}
            />
        </ATag>
    );
}