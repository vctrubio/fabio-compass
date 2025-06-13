import React from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';

interface LessonTagProps {
    teacherName: string;
    status: string;
    className?: string;
}

// Status color mapping
const statusColorMap: Record<string, string> = {
    planned: 'bg-gray-100',
    ongoing: 'bg-blue-100',
    completed: 'bg-green-100',
    delegated: 'bg-yellow-100',
    cancelled: 'bg-red-100'
};

export function LessonTag({ teacherName, status, className }: LessonTagProps) {
    const LessonIcon = ENTITY_CONFIGS.lessons.icon;
    const statusColor = statusColorMap[status] || statusColorMap.planned; // fallback to planned
    
    return (
        <ATag
            icon={<LessonIcon className="w-4 h-4" />}
            className={className}
        >
            <span>{teacherName}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <span className={`text-xs font-medium rounded px-1 ${statusColor}`}>
                {status}
            </span>
        </ATag>
    );
}
