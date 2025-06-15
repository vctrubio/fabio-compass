import { drizzleBookings } from "@/rails/controller/BookingDrizzle";
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import { drizzleStudents } from "@/rails/controller/StudentDrizzle";
import { drizzlePackages } from "@/rails/controller/PackageDrizzle";
import { AdminProvider } from "@/providers/AdminProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all admin data at the layout level
  const bookingsData = await drizzleBookings();
  const teachersData = await drizzleTeachers();
  const studentsData = await drizzleStudents();
  const packagesData = await drizzlePackages();

  return (
    <div className="min-h-screen bg-background">
      <AdminProvider 
        bookingsData={bookingsData} 
        teachersData={teachersData} 
        studentsData={studentsData}
        packagesData={packagesData}
      >
        {children}
      </AdminProvider>
    </div>
  );
}