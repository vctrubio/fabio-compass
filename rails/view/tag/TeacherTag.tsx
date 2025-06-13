import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

interface TeacherFromRelation {
    name: string;
}

interface TeacherTagProps {
    teacher: TeacherFromRelation;
}

export function TeacherTag({ teacher }: TeacherTagProps) {
    const TeacherIcon = ENTITY_CONFIGS.teachers.icon;
    
    return (
        <ATag
            icon={<TeacherIcon className="w-4 h-4" />}
        >
            <span>{teacher.name}</span>
        </ATag>
    );
}
