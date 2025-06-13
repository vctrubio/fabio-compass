'use client';

import React, { useState } from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getLessonStatusColor, updateLessonIdStatus } from '@/actions/enums';
import { LessonStatusEnum } from '@/rails/model/EnumModel';
import { DropdownTag } from './DropdownTag';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LessonFromRelation {
    id: string;
    status: string;
    teacher?: { name: string };
}

interface LessonTagProps {
    lesson: LessonFromRelation;
}

export function LessonTag({ lesson }: LessonTagProps) {
    const [isLoading, setIsLoading] = useState(false);
    const LessonIcon = ENTITY_CONFIGS.lessons.icon;
    const statusColor = getLessonStatusColor(lesson.status);

    const handleStatusClick = async (newStatus: string) => {
        if (isLoading || newStatus === lesson.status) return;
        
        setIsLoading(true);
        console.log(`Lesson status update requested for ${lesson.id}: ${lesson.status} → ${newStatus}`);
        
        try {
            const result = await updateLessonIdStatus(lesson, newStatus);
            
            if (result.success) {
                console.log('Lesson status updated successfully:', result.data);
                // Success toast is handled by the action itself
            } else {
                console.error('Failed to update lesson status:', result.error);
                toast.error(`Failed to update lesson status: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating lesson status:', error);
            toast.error(`Error updating lesson status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = LessonStatusEnum.options.map((status) => ({
        value: status,
        label: status,
        colorClass: getLessonStatusColor(status)
    }));
    
    return (
        <ATag
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LessonIcon className="w-4 h-4" />}
        >
            <span>{lesson.teacher?.name || 'N/A PROBLEM'}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <DropdownTag
                currentValue={lesson.status}
                options={statusOptions}
                onSelect={handleStatusClick}
                currentColorClass={statusColor}
                disabled={isLoading}
            />
        </ATag>
    );
}
