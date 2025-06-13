import React from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getDateString, getTime } from '@/components/getters';
import { formatDuration } from '@/components/formatters';

interface KiteEventTagProps {
    duration: number; // Duration in minutes
    date: string; // ISO date string
    status?: string; // KiteEvent status
    location?: string; // KiteEvent location
    className?: string;
}

// Status color mapping for KiteEvent
const statusColorMap: Record<string, string> = {
    planned: 'bg-gray-100',
    'teacher confirmation': 'bg-orange-100',
    completed: 'bg-green-100'
};

export function KiteEventTag({ duration, date, status, location, className }: KiteEventTagProps) {
    const KiteEventIcon = ENTITY_CONFIGS.kiteEvents.icon;
    
    const dateObj = new Date(date);
    const statusColor = status ? statusColorMap[status] || statusColorMap.planned : undefined; // fallback to planned
    
    return (
        <ATag
            icon={<KiteEventIcon className="w-4 h-4" />}
            className={className}
        >
            <span>{formatDuration(duration)}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <span>{getTime(dateObj)}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <span>{getDateString(dateObj)}</span>
            
            {location && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">{location}</span>
                </>
            )}
            
            {status && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className={`text-xs font-medium rounded px-1 ${statusColor}`}>
                        {status}
                    </span>
                </>
            )}
        </ATag>
    );
}
