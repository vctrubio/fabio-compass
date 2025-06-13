import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

interface TeacherTagProps {
    name: string;
    className?: string;
}

export function TeacherTag({ name, className }: TeacherTagProps) {
    const TeacherIcon = ENTITY_CONFIGS.teachers.icon;
    
    return (
        <ATag
            icon={<TeacherIcon className="w-4 h-4" />}
            className={className}
        >
            <span>{name}</span>
        </ATag>
    );
}
