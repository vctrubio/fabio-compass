import { drizzleBookings } from "@/rails/controller/BookingDrizzle";
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import { drizzleStudents } from "@/rails/controller/StudentDrizzle";
import WhiteboardPlanning from "@/components/hostelworld/whiteboard-planning";
import { AdminProvider } from "@/components/providers/AdminProvider";

export default async function FabioPage() {
  const bookingsData = await drizzleBookings();
  const teachersData = await drizzleTeachers();
  const studentsData = await drizzleStudents();

  return (
    <main className="min-h-screenp-8 border">
      {/* Whiteboard Planning Section */}
      <div className="w-full">
        <AdminProvider bookingsData={bookingsData} teachersData={teachersData} studentsData={studentsData}>
          <WhiteboardPlanning />
        </AdminProvider>
      </div>
    </main>
  );
}
