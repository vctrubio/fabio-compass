'use client';

import React, { useState } from 'react';
import { OrganizedLessons, TeacherLessonData } from '@/rails/controller/TeacherCsv';
import { TeacherConfirmationDropdown } from './TeacherConfirmationDropdown';
import { FormatDateWithWeek } from '@/components/formatters';
import { cn } from '@/lib/utils';

interface TeacherDashboardProps {
  teacher: {
    id: string;
    name: string;
    teacher_role: string;
    languages?: string[];
    phone?: string;
  };
  organizedLessons: OrganizedLessons;
}

interface LessonCardProps {
  lesson: TeacherLessonData;
  onStatusUpdate?: (lessonId: string, eventId: string, newStatus: string) => void;
}

function LessonCard({ lesson, onStatusUpdate }: LessonCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {lesson.students.map((student, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              {student}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <TeacherConfirmationDropdown 
            eventId={lesson.lesson_id}
            currentStatus={lesson.lesson_status}
            onStatusChange={(newStatus) => onStatusUpdate?.(lesson.lesson_id, lesson.lesson_id, newStatus)}
            isLessonStatus={true}
          />
        </div>
      </div>

      {lesson.kite_events.length > 0 && (
        <div className="space-y-2">
          {lesson.kite_events.map((event) => (
            <div key={event.id} className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <FormatDateWithWeek dateStr={event.date} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-700">
                        {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="text-sm text-gray-600">
                        {event.location} • {event.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                <TeacherConfirmationDropdown 
                  eventId={event.id}
                  currentStatus={event.status}
                  onStatusChange={(newStatus) => onStatusUpdate?.(lesson.lesson_id, event.id, newStatus)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherDashboard({ teacher, organizedLessons }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');

  const handleStatusUpdate = async (lessonId: string, eventId: string, newStatus: string) => {
    // TODO: Implement API call to update kite event status
    console.log('Updating status:', { lessonId, eventId, newStatus });
    // For now, just log - you'll need to implement the actual API call
  };

  const tabs = [
    { key: 'today' as const, label: 'Today', count: organizedLessons.today.length },
    { key: 'upcoming' as const, label: 'Upcoming', count: organizedLessons.upcoming.length },
    { key: 'past' as const, label: 'Past', count: organizedLessons.past.length },
  ];

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {organizedLessons[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No lessons found for {activeTab}.</p>
            {activeTab !== 'past' && (
              <p className="text-xs text-gray-400 mt-2">
                Only lessons with 'completed' or 'teacherConfirmation' kite events are shown.
              </p>
            )}
          </div>
        ) : (
          organizedLessons[activeTab].map((lesson) => (
            <LessonCard 
              key={lesson.lesson_id} 
              lesson={lesson} 
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}