import React from 'react';
import { AStr } from './AStr';
import { ENTITY_CONFIGS } from '@/config/entities';

interface StudentStrProps {
    name: string;
    className?: string;
}

export function StudentStr({ name, className }: StudentStrProps) {
    const StudentIcon = ENTITY_CONFIGS.students.icon;
    
    return (
        <AStr
            icon={<StudentIcon className="w-4 h-4" />}
            className={className}
        >
            {name}
        </AStr>
    );
}
