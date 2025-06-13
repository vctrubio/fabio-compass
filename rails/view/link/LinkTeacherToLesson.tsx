'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { createLesson } from '@/actions/lesson-actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FlagIcon } from '@/assets/svg/FlagIcon';
import { ALink } from '@/rails/view/link/ALink';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/components/providers/AdminProvider';

export interface TeacherParams {
  id: string;
  name: string;
}

interface LinkTeacherToLessonProps {
  bookingId: string;
  className?: string;
}

export function LinkTeacherToLesson({ bookingId, className }: LinkTeacherToLessonProps) {
  const { teachersData } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTeacherId, setLoadingTeacherId] = useState<string | null>(null);

  // Convert teachers data to TeacherParams format
  const teachers: TeacherParams[] = teachersData.map(teacher => ({
    id: teacher.model.id,
    name: teacher.model.name
  }));

  const handleCreateLesson = async (teacherId: string, teacherName: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingTeacherId(teacherId);
    console.log(`Creating new lesson for booking ${bookingId} with teacher ${teacherName} (${teacherId})`);

    try {
      // Call the server action to create the lesson
      const result = await createLesson(bookingId, teacherId);

      if (result.success) {
        console.log('Lesson created successfully:', result.data);
        // Success toast is handled by the action itself
      } else {
        console.error('Failed to create lesson:', result.error);
        toast.error(`Failed to create lesson: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error(`Failed to create lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingTeacherId(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <ALink
          icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlagIcon className="w-3.5 h-3.5" />}
          className={`${className || ''} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span className="text-xs font-medium">{isLoading ? 'Creating...' : 'Link Teacher'}</span>
        </ALink>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px] p-1">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <DropdownMenuItem
              key={teacher.id}
              onClick={() => handleCreateLesson(teacher.id, teacher.name)}
              className="text-sm hover:bg-transparent focus:bg-transparent p-1 cursor-pointer"
              disabled={isLoading}
            >
              <span className="w-full inline-flex items-center justify-between text-xs font-medium rounded-md px-2 py-1.5 bg-gray-200 text-gray-900">
                {loadingTeacherId === teacher.id ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {teacher.name}
                  </div>
                ) : (
                  teacher.name
                )}
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