import React from 'react';
import { AStr } from './AStr';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getDateString, getTime } from '@/components/getters';
import { formatDuration } from '@/components/formatters';
import { getKiteEventStatusColor } from '@/actions/enums';

interface KiteEventStrProps {
    duration: number; // Duration in minutes
    date: string; // ISO date string
    status?: string; // KiteEvent status
    location?: string; // KiteEvent location
    className?: string;
}

export function KiteEventStr({ duration, date, status, location, className }: KiteEventStrProps) {
    const KiteEventIcon = ENTITY_CONFIGS.kiteEvents.icon;
    
    const dateObj = new Date(date);
    const statusColor = status ? getKiteEventStatusColor(status) : undefined;
    
    return (
        <AStr
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
        </AStr>
    );
}
