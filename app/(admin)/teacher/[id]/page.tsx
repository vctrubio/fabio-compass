import React from "react";
import {
  getTeacherLessons,
  getTeacherById,
} from "@/rails/controller/TeacherCsv";
import { TeacherKiteClass } from "@/components/hostelworld/TeacherKiteClass";
import { KiteEventData } from "@/components/hostelworld/types";

interface TeacherPageProps {
  params: {
    id: string;
  };
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { id: teacherId } = await params;

  const [teacher, organizedLessons] = await Promise.all([
    getTeacherById(teacherId),
    getTeacherLessons(teacherId),
  ]);

  if (!teacher) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Teacher Not Found</h1>
          <p className="text-gray-600 mt-2">
            The teacher with ID {teacherId} does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 mx-auto flex items-center">
      <h1 className="text-3xl font-bold mx-auto">Hola {teacher.name}</h1>
    </div>
  );
}
