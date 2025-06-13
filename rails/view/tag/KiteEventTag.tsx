'use client';

import React, { useState, useEffect } from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getDateString, getTime } from '@/components/getters';
import { formatDuration } from '@/components/formatters';
import { getKiteEventStatusColor, updateKiteEventIdStatus } from '@/actions/enums';
import { KiteEventStatusEnum } from '@/rails/model/EnumModel';
import { DropdownTag } from './DropdownTag';
import { toast } from 'sonner';
import { EquipmentType } from '@/rails/model/EquipmentModel';
import { Loader2 } from 'lucide-react';
import { internalActionTracker } from '@/components/providers/AdminProvider';

interface KiteEventFromRelation {
    id: string;
    duration: number; // Duration in minutes
    date: string; // ISO date string
    status?: string; // KiteEvent status
    location?: string; // KiteEvent location
    equipments?: EquipmentType[];
}

interface KiteEventTagProps {
    kiteEvent: KiteEventFromRelation;
}

export function KiteEventTag({ kiteEvent }: KiteEventTagProps) {
    const [isLoading, setIsLoading] = useState(false);
    const KiteEventIcon = ENTITY_CONFIGS.kiteEvents.icon;

    const dateObj = new Date(kiteEvent.date);
    const statusColor = kiteEvent.status ? getKiteEventStatusColor(kiteEvent.status) : undefined;

    // Monitor the internal action tracker to coordinate UI state
    useEffect(() => {
        let unmounted = false;
        let timer: NodeJS.Timeout | null = null;

        // Only set up monitoring if we're currently loading
        if (!isLoading) return;

        const checkComplete = () => {
            // Only proceed if the component is still mounted and we're in loading state
            if (unmounted) return;
            
            // If the action is no longer executing, that means the server action has completed
            if (!internalActionTracker.isExecuting()) {
                // Use a longer delay to ensure complete refresh
                timer = setTimeout(() => {
                    if (!unmounted) {
                        setIsLoading(false);
                    }
                }, 800); // Longer delay to ensure router has completely refreshed
            } else {
                // Keep checking while action is executing
                timer = setTimeout(checkComplete, 100);
            }
        };
        
        // Start the checking process
        timer = setTimeout(checkComplete, 100);
        
        // Clean up on unmount or when loading state changes
        return () => {
            unmounted = true;
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

    const handleStatusClick = async (newStatus: string) => {
        if (isLoading || newStatus === kiteEvent.status) return;

        setIsLoading(true);
        console.log(`Kite event status update requested for ${kiteEvent.id}: ${kiteEvent.status} → ${newStatus}`);

        try {
            const eventWithStatus = {
                id: kiteEvent.id,
                status: kiteEvent.status || 'planned'
            };

            const result = await updateKiteEventIdStatus(eventWithStatus, newStatus);

            if (!result.success) {
                console.error('Failed to update kite event status:', result.error);
                toast.error(`Failed to update kite event status: ${result.error}`);
                // Reset loading state for failures immediately
                setIsLoading(false);
            } else {
                console.log('Kite event status updated successfully:', result.data);
                // For success, don't reset loading state yet
                // The useEffect will handle it after the refresh completes
            }
        } catch (error) {
            console.error('Error updating kite event status:', error);
            toast.error(`Error updating kite event status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Reset loading state for exceptions immediately
            setIsLoading(false);
        }
    };

    const statusOptions = KiteEventStatusEnum.options
        .filter(status => status !== 'plannedAuto')
        .map((status) => ({
            value: status,
            label: status,
            colorClass: getKiteEventStatusColor(status)
        }));

    return (
        <ATag
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KiteEventIcon className="w-4 h-4" />}
        >
            <span>{formatDuration(kiteEvent.duration)}</span>

            <Separator orientation="vertical" className="h-4" />

            <span>{getTime(dateObj)}</span>


            <span>{getDateString(dateObj)}</span>

            {kiteEvent.location && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">{kiteEvent.location}</span>
                </>
            )}

            {kiteEvent.status && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <DropdownTag
                        currentValue={kiteEvent.status}
                        options={statusOptions}
                        onSelect={handleStatusClick}
                        currentColorClass={statusColor!}
                        disabled={isLoading}
                    />
                </>
            )}
        </ATag>
    );
}
