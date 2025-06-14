import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

export function StudentTag({ name }: { name: string }) {
    const StudentIcon = ENTITY_CONFIGS.students.icon;
    
    return (
        <ATag
            icon={<StudentIcon className="w-4 h-4" />}
        >
            {name}
        </ATag>
    );
}