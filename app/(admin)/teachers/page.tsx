import {
  HeadsetIcon,
  HelmetIcon,
  FlagIcon,
  KiteIcon,
  ClockIcon,
  UsersIcon,
} from "@/assets/svg";
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import Link from "next/link";
import { TEACHER_SORT_ORDER } from "@/components/hostelworld/whiteboard-teacher-order";

export default async function TeacherPage() {
  const teachers = await drizzleTeachers();

  // Sort teachers based on TEACHER_SORT_ORDER
  const sortedTeachers = teachers.sort((a, b) => {
    const indexA = TEACHER_SORT_ORDER.indexOf(a.model.name);
    const indexB = TEACHER_SORT_ORDER.indexOf(b.model.name);

    if (indexA === -1 && indexB === -1) {
      return 0; // Both not in sort order, maintain original relative order
    } else if (indexA === -1) {
      return 1; // a is not in sort order, b comes first
    } else if (indexB === -1) {
      return -1; // b is not in sort order, a comes first
    } else {
      return indexA - indexB; // Sort by the defined order
    }
  });

  return (
    <main className="flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-300 mb-8">
          Teachers Registry
        </h1>
        <div className="flex flex-col gap-4 w-full max-w-md">
          {sortedTeachers.map((teacher) => (
            <Link key={teacher.model.id} href={`/teachers/${teacher.model.id}`}>
              <div className="flex items-center p-6 border-2 border-emerald-600 bg-transparent rounded-xl shadow-lg cursor-pointer hover:bg-emerald-50 transition-colors duration-200">
                <HeadsetIcon className="h-16 w-16 text-slate-700 dark:text-slate-200 mr-4" />
                <div className="flex flex-col items-start">
                  <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    {teacher.model.name}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Students: {teacher.lambdas.totalStudents}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FlagIcon className="h-4 w-4 mr-2" />
                    Lessons: {teacher.lambdas.totalLessons}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <KiteIcon className="h-4 w-4 mr-2" />
                    Kite Lessons: {teacher.lambdas.totalKiteEvents}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Teaching Hours:{" "}
                    {Number.isInteger(teacher.lambdas.totalTeachingHours / 60)
                      ? teacher.lambdas.totalTeachingHours / 60
                      : (teacher.lambdas.totalTeachingHours / 60).toFixed(1)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
