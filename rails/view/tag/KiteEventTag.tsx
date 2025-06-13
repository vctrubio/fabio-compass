'use client';

import React from 'react';
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
    const KiteEventIcon = ENTITY_CONFIGS.kiteEvents.icon;

    const dateObj = new Date(kiteEvent.date);
    const statusColor = kiteEvent.status ? getKiteEventStatusColor(kiteEvent.status) : undefined;

    const handleStatusClick = async (newStatus: string) => {
        console.log(`Kite event status update requested for ${kiteEvent.id}: ${kiteEvent.status} → ${newStatus}`);

        try {
            const eventWithStatus = {
                id: kiteEvent.id,
                status: kiteEvent.status || 'planned'
            };

            const result = await updateKiteEventIdStatus(eventWithStatus, newStatus);

            if (result.success) {
                console.log('Kite event status updated successfully:', result.data);
            } else {
                console.error('Failed to update kite event status:', result.error);
                toast.error(`Failed to update kite event status: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating kite event status:', error);
            toast.error(`Error updating kite event status: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            icon={<KiteEventIcon className="w-4 h-4" />}
        >
            <span>{formatDuration(kiteEvent.duration)}</span>

            <Separator orientation="vertical" className="h-4" />

            <span>{getTime(dateObj)}</span>

            <Separator orientation="vertical" className="h-4" />

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
                    />
                </>
            )}
        </ATag>
    );
}
