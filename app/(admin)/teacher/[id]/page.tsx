import React from 'react';
import { getTeacherLessons, getTeacherById, calculateTeacherStats } from '@/rails/controller/TeacherCsv';
import { TeacherDashboard } from './TeacherDashboard';

interface TeacherPageProps {
  params: {
    id: string;
  };
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const teacherId = params.id;
  
  const [teacher, organizedLessons] = await Promise.all([
    getTeacherById(teacherId),
    getTeacherLessons(teacherId),
  ]);

  if (!teacher) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Teacher Not Found</h1>
          <p className="text-gray-600 mt-2">The teacher with ID {teacherId} does not exist.</p>
        </div>
      </div>
    );
  }

  const stats = calculateTeacherStats(organizedLessons);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{teacher.name}</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>Role: {teacher.teacher_role}</span>
          <span>Languages: {teacher.languages?.join(', ')}</span>
          {teacher.phone && <span>Phone: {teacher.phone}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Lessons</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalLessons}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Kite Events</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalKiteEvents}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Total Minutes</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalDuration}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Pending Confirmations</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingConfirmations}</p>
        </div>
      </div>

      <TeacherDashboard 
        teacher={teacher}
        organizedLessons={organizedLessons}
      />
    </div>
  );
}