'use client';

import React, { useState, useEffect } from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getLessonStatusColor, updateLessonIdStatus } from '@/actions/enums';
import { LessonStatusEnum } from '@/rails/model/EnumModel';
import { DropdownTag } from './DropdownTag';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { internalActionTracker } from '@/providers/AdminProvider';
import { formatDuration } from '@/components/formatters';
import { KiteIcon } from '@/assets/svg/KiteIcon';

interface LessonFromRelation {
    id: string;
    status: string;
    teacher?: { name: string };
    kiteEvents?: Array<{
        id: string;
        duration: number;
        date: string;
        status?: string;
        location?: string;
    }>;
}

interface LessonTagProps {
    lesson: LessonFromRelation;
}

export function LessonTag({ lesson }: LessonTagProps) {
    const [isLoading, setIsLoading] = useState(false);
    const LessonIcon = ENTITY_CONFIGS.lessons.icon;
    const statusColor = getLessonStatusColor(lesson.status);

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
        if (isLoading || newStatus === lesson.status) return;

        setIsLoading(true);
        console.log(`Lesson status update requested for ${lesson.id}: ${lesson.status} → ${newStatus}`);

        try {
            const result = await updateLessonIdStatus(lesson, newStatus);

            if (!result.success) {
                console.error('Failed to update lesson status:', result.error);
                toast.error(`Failed to update lesson status: ${result.error}`);
                // Reset loading state for failures immediately
                setIsLoading(false);
            } else {
                console.log('Lesson status updated successfully:', result.data);
                // For success, don't reset loading state yet
                // The useEffect will handle it after the refresh completes
            }
        } catch (error) {
            console.error('Error updating lesson status:', error);
            toast.error(`Error updating lesson status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Reset loading state for exceptions immediately
            setIsLoading(false);
        }
    };

    const statusOptions = LessonStatusEnum.options.map((status) => ({
        value: status,
        label: status,
        colorClass: getLessonStatusColor(status)
    }));

    // Calculate kite event stats
    const kiteEventsCount = lesson.kiteEvents?.length || 0;
    const totalKiteEventMinutes = lesson.kiteEvents?.reduce(
        (sum, event) => sum + (event.duration || 0),
        0
    ) || 0;

    return (
        <ATag
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LessonIcon className="w-4 h-4" />}
        >
            <span>{lesson.teacher?.name || 'N/A PROBLEM'}</span>

            <DropdownTag
                currentValue={lesson.status}
                options={statusOptions}
                onSelect={handleStatusClick}
                currentColorClass={statusColor}
                disabled={isLoading}
            />


            {kiteEventsCount > 0 && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                        {Array.from({ length: kiteEventsCount }).map((_, i) => (
                            <KiteIcon key={i} className="w-3.5 h-3.5" />
                        ))}
                        <span>-</span>
                        <span>{formatDuration(totalKiteEventMinutes)}</span>
                    </span>
                </>
            )}
        </ATag>
    );
}
