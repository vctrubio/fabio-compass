'use client';

import React from 'react';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';
import { LinkTeacherToLesson } from '@/rails/view/link/LinkTeacherToLesson';

interface NoLessonTagProps {
  bookingId: string;
}

export function NoLessonTag({ bookingId }: NoLessonTagProps) {
  const LessonIcon = ENTITY_CONFIGS.lessons.icon;

  return (
    <ATag icon={<LessonIcon className="w-4 h-4" />}>
      <span className="text-xs text-muted-foreground">No Lessons</span>
      <LinkTeacherToLesson bookingId={bookingId} />
    </ATag>
  );
}
