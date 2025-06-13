import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

interface StudentFromLambda {
    id: string;
    name: string;
    languages?: string;
}

interface StudentTagProps {
    student: StudentFromLambda;
}

export function StudentTag({ student }: StudentTagProps) {
    const StudentIcon = ENTITY_CONFIGS.students.icon;
    
    return (
        <ATag
            icon={<StudentIcon className="w-4 h-4" />}
        >
            {student.name}
        </ATag>
    );
}