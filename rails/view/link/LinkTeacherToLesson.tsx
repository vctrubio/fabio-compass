'use client';

import React from 'react';
import { toast } from 'sonner';
import { createLesson } from '@/actions/lesson-create';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FlagIcon } from '@/assets/svg/FlagIcon';
import { ALink } from '@/rails/view/link/ALink';

// Simple interface for teacher params - only requires id and name
export interface TeacherParams {
  id: string;
  name: string;
}

interface LinkTeacherToLessonProps {
  bookingId: string;
  teachers: TeacherParams[];
  className?: string;
}

export function LinkTeacherToLesson({ bookingId, teachers, className }: LinkTeacherToLessonProps) {
  const handleCreateLesson = async (teacherId: string, teacherName: string) => {
    console.log(`Creating new lesson for booking ${bookingId} with teacher ${teacherName} (${teacherId})`);
    
    try {
      // Call the server action to create the lesson
      const result = await createLesson(bookingId, teacherId);
      
      if (result.success) {
        toast.success(`Lesson created for teacher ${teacherName}`);
        console.log('Lesson created successfully:', result.data);
      } else {
        console.error('Failed to create lesson:', result.error);
        toast.error(`Failed to create lesson: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error(`Failed to create lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ALink 
          icon={<FlagIcon className="w-3.5 h-3.5" />}
          className={`${className || ''}`}
        >
          <span className="text-xs font-medium">Link Teacher</span>
        </ALink>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px] p-1">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <DropdownMenuItem
              key={teacher.id}
              onClick={() => handleCreateLesson(teacher.id, teacher.name)}
              className="text-sm hover:bg-transparent focus:bg-transparent p-1 cursor-pointer"
            >
              <span className="w-full inline-flex items-center justify-between text-xs font-medium rounded-md px-2 py-1.5 bg-gray-200 text-gray-900">
                {teacher.name}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground p-1">
            No teachers available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}