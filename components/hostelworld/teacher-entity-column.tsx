import React from 'react';
import { HeadsetIcon } from '@/assets/svg/HeadsetIcon';

interface TeacherWithAvailability {
  teacher_id: string;
  teacher_name: string;
  available_hours: number;
  total_events: number;
  status?: string;
  confirmation_status?: 'pending' | 'confirmed' | 'declined';
}

interface TeacherEntityColumnProps {
  teachers?: TeacherWithAvailability[];
  onEntityClick?: (entityId: string, entityType: 'teacher' | 'student' | 'lesson') => void;
  selectedTeachers?: Array<{
    teacherId: string;
    teacherName: string;
  }>;
}

export function TeacherEntityColumn({ 
  teachers = [], 
  onEntityClick,
  selectedTeachers = []
}: TeacherEntityColumnProps) {
  console.log('teachers i see....', teachers);

  const renderTeacher = (teacher: TeacherWithAvailability) => {
    const isSelected = selectedTeachers.some(t => t.teacherId === teacher.teacher_id);
    
    const getConfirmationColor = (status?: string) => {
      switch(status) {
        case 'confirmed':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'declined':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      }
    };
    
    return (
      <div 
        key={teacher.teacher_id}
        onClick={() => onEntityClick?.(teacher.teacher_id, 'teacher')}
        className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {/* Teacher Header */}
        <div className="space-y-2">
          {/* Teacher info */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-2">
              <HeadsetIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              {teacher.teacher_name}
            </span>
            <span className={`px-2 py-1 rounded-full font-medium text-xs ${teacher.available_hours > 0
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
              {teacher.available_hours.toFixed(1)}h available
            </span>
          </div>
          
          {/* Teacher status and confirmation */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              {teacher.total_events} events | {teacher.status || 'active'}
            </span>
            {teacher.confirmation_status && (
              <span className={`px-2 py-1 rounded-full font-medium text-xs ${getConfirmationColor(teacher.confirmation_status)}`}>
                {teacher.confirmation_status}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg px-1 py-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 flex-shrink-0">
        <HeadsetIcon className="w-6 h-6" />
        Teachers
      </h2>
      <div className="overflow-y-auto flex-1">
        {teachers?.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No available teachers
          </div>
        ) : (
          <div className="space-y-3">
            {teachers.map(renderTeacher)}
          </div>
        )}
      </div>
    </div>
  );
}