import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

interface StudentTagProps {
    name: string;
    className?: string;
}

export function StudentTag({ name, className }: StudentTagProps) {
    const StudentIcon = ENTITY_CONFIGS.students.icon;
    
    return (
        <ATag
            icon={<StudentIcon className="w-4 h-4" />}
            className={className}
        >
            {name}
        </ATag>
    );
}