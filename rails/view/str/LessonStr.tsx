import React from 'react';
import { AStr } from './AStr';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { getLessonStatusColor } from '@/actions/enums';

interface LessonStrProps {
    teacherName: string;
    status: string;
    className?: string;
}

export function LessonStr({ teacherName, status, className }: LessonStrProps) {
    const LessonIcon = ENTITY_CONFIGS.lessons.icon;
    const statusColor = getLessonStatusColor(status);
    
    return (
        <AStr
            icon={<LessonIcon className="w-4 h-4" />}
            className={className}
        >
            <span>{teacherName}</span>
            
            <Separator orientation="vertical" className="h-4" />
            
            <span className={`text-xs font-medium rounded px-1 ${statusColor}`}>
                {status}
            </span>
        </AStr>
    );
}
