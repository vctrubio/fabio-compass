import React from 'react';
import { AStr } from './AStr';
import { ENTITY_CONFIGS } from '@/config/entities';

interface TeacherStrProps {
    name: string;
    className?: string;
}

export function TeacherStr({ name, className }: TeacherStrProps) {
    const TeacherIcon = ENTITY_CONFIGS.teachers.icon;
    
    return (
        <AStr
            icon={<TeacherIcon className="w-4 h-4" />}
            className={className}
        >
            <span>{name}</span>
        </AStr>
    );
}
