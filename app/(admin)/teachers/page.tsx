import React from 'react';
import { getAllTeachersStats, calculateOverallStats, getAvailableMonths } from '@/rails/controller/TeachersStats';
import { TeachersDashboard } from './TeachersDashboard';

interface TeachersPageProps {
  searchParams: {
    month?: string;
  };
}

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  const monthFilter = searchParams.month;
  
  const [teachersStats, availableMonths] = await Promise.all([
    getAllTeachersStats(monthFilter),
    Promise.resolve(getAvailableMonths()),
  ]);

  const overallStats = calculateOverallStats(teachersStats);

  const selectedMonthLabel = monthFilter 
    ? new Date(`${monthFilter}-01`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'All Time';

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teachers Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of all teachers and their performance - {selectedMonthLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Teachers</h3>
          <p className="text-2xl font-bold text-blue-600">{overallStats.totalTeachers}</p>
          <p className="text-xs text-blue-600 mt-1">
            Avg {overallStats.averageLessonsPerTeacher} lessons each
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Total Lessons</h3>
          <p className="text-2xl font-bold text-green-600">{overallStats.totalLessons}</p>
          <p className="text-xs text-green-600 mt-1">
            {overallStats.totalKiteEvents} kite events
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Money Earned</h3>
          <p className="text-2xl font-bold text-purple-600">€{overallStats.totalMoneyEarned}</p>
          <p className="text-xs text-purple-600 mt-1">
            Avg €{overallStats.averageMoneyPerTeacher} per teacher
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Total Hours</h3>
          <p className="text-2xl font-bold text-orange-600">{overallStats.totalDurationHours}h</p>
          <p className="text-xs text-orange-600 mt-1">
            {overallStats.totalPendingConfirmations} pending confirmations
          </p>
        </div>
      </div>

      <TeachersDashboard 
        teachersStats={teachersStats}
        availableMonths={availableMonths}
        selectedMonth={monthFilter}
        overallStats={overallStats}
      />
    </div>
  );
}