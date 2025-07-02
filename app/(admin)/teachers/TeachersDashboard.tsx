'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TeacherStatsData } from '@/rails/controller/TeachersStats';
import { cn } from '@/lib/utils';

interface TeachersDashboardProps {
  teachersStats: TeacherStatsData[];
  availableMonths: string[];
  selectedMonth?: string;
  overallStats: {
    totalTeachers: number;
    totalLessons: number;
    totalKiteEvents: number;
    totalMoneyEarned: number;
    totalDurationHours: number;
    totalPendingConfirmations: number;
    averageLessonsPerTeacher: number;
    averageMoneyPerTeacher: number;
  };
}

interface TeacherCardProps {
  teacher: TeacherStatsData;
  onClick: (teacherId: string) => void;
}

function TeacherCard({ teacher, onClick }: TeacherCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'priority': return 'bg-purple-100 text-purple-800';
      case 'default': return 'bg-blue-100 text-blue-800';
      case 'freelance': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={() => onClick(teacher.teacher_id)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{teacher.teacher_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("px-2 py-1 rounded text-xs font-medium", getRoleColor(teacher.teacher_role))}>
              {teacher.teacher_role}
            </span>
            {teacher.pending_confirmations > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                {teacher.pending_confirmations} pending
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">€{teacher.money_earned}</p>
          <p className="text-xs text-gray-500">earned</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-blue-50 p-3 rounded">
          <p className="text-xl font-bold text-blue-600">{teacher.lesson_count}</p>
          <p className="text-xs text-blue-600">Lessons</p>
        </div>
        <div className="text-center bg-green-50 p-3 rounded">
          <p className="text-xl font-bold text-green-600">{teacher.kite_event_count}</p>
          <p className="text-xs text-green-600">Events</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          <p>{Math.round(teacher.total_duration_minutes / 60)}h taught</p>
          <p>{teacher.completed_events} completed</p>
        </div>
        <div className="text-right">
          <p>Languages: {teacher.languages.slice(0, 2).join(', ')}</p>
          {teacher.languages.length > 2 && (
            <p className="text-xs">+{teacher.languages.length - 2} more</p>
          )}
        </div>
      </div>

      {teacher.phone && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">📞 {teacher.phone}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Click to view details</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function TeachersDashboard({ 
  teachersStats, 
  availableMonths, 
  selectedMonth,
  overallStats 
}: TeachersDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<'money' | 'lessons' | 'name'>('money');

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (month === 'all') {
      params.delete('month');
    } else {
      params.set('month', month);
    }
    router.push(`/teachers?${params.toString()}`);
  };

  const handleTeacherClick = (teacherId: string) => {
    const params = selectedMonth ? `?month=${selectedMonth}` : '';
    router.push(`/teacher/${teacherId}${params}`);
  };

  const sortedTeachers = [...teachersStats].sort((a, b) => {
    switch (sortBy) {
      case 'money':
        return b.money_earned - a.money_earned;
      case 'lessons':
        return b.lesson_count - a.lesson_count;
      case 'name':
        return a.teacher_name.localeCompare(b.teacher_name);
      default:
        return 0;
    }
  });

  const formatMonthLabel = (month: string) => {
    const date = new Date(`${month}-01`);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex gap-2">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-700 self-center">
            Filter by month:
          </label>
          <select
            id="month-filter"
            value={selectedMonth || 'all'}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 self-center">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'money' | 'lessons' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="money">Money Earned</option>
            <option value="lessons">Number of Lessons</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {sortedTeachers.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedMonth ? `No teachers have activity for ${formatMonthLabel(selectedMonth)}` : 'No teachers in the system yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.teacher_id}
              teacher={teacher}
              onClick={handleTeacherClick}
            />
          ))}
        </div>
      )}

      {sortedTeachers.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Top Earner:</span>
              <p className="font-medium">{sortedTeachers[0]?.teacher_name} (€{sortedTeachers[0]?.money_earned})</p>
            </div>
            <div>
              <span className="text-gray-600">Most Active:</span>
              <p className="font-medium">
                {[...sortedTeachers].sort((a, b) => b.lesson_count - a.lesson_count)[0]?.teacher_name} 
                ({[...sortedTeachers].sort((a, b) => b.lesson_count - a.lesson_count)[0]?.lesson_count} lessons)
              </p>
            </div>
            <div>
              <span className="text-gray-600">Avg per Teacher:</span>
              <p className="font-medium">€{overallStats.averageMoneyPerTeacher}</p>
            </div>
            <div>
              <span className="text-gray-600">Pending Actions:</span>
              <p className="font-medium text-orange-600">{overallStats.totalPendingConfirmations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}