'use client';

import React from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getLessonStatusColor, updateLessonIdStatus } from '@/actions/enums';
import { LessonStatusEnum } from '@/rails/model/EnumModel';
import { DropdownTag } from './DropdownTag';
import { toast } from 'sonner';

interface LessonFromRelation {
    id: string;
    status: string;
    teacher?: { name: string };
}

interface LessonTagProps {
    lesson: LessonFromRelation;
}

export function LessonTag({ lesson }: LessonTagProps) {
    const LessonIcon = ENTITY_CONFIGS.lessons.icon;
    const statusColor = getLessonStatusColor(lesson.status);

    const handleStatusClick = async (newStatus: string) => {
        console.log(`Lesson status update requested for ${lesson.id}: ${lesson.status} → ${newStatus}`);
        
        try {
            const result = await updateLessonIdStatus(lesson, newStatus);
            
            if (result.success) {
                console.log('Lesson status updated successfully:', result.data);
            } else {
                console.error('Failed to update lesson status:', result.error);
                toast.error(`Failed to update lesson status: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating lesson status:', error);
            toast.error(`Error updating lesson status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const statusOptions = LessonStatusEnum.options.map((status) => ({
        value: status,
        label: status,
        colorClass: getLessonStatusColor(status)
    }));
    
    return (
        <ATag
            icon={<LessonIcon className="w-4 h-4" />}
        >
            <span>{lesson.teacher?.name || 'N/A PROBLEM'}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <DropdownTag
                currentValue={lesson.status}
                options={statusOptions}
                onSelect={handleStatusClick}
                currentColorClass={statusColor}
            />
        </ATag>
    );
}
