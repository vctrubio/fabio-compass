import { drizzleBookings } from "@/rails/controller/BookingDrizzle";
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import WhiteboardPlanning from "@/components/hostelworld/whiteboard-planning";

export default async function FabioPage() {
  const bookingsData = await drizzleBookings();
  const teachersData = await drizzleTeachers();

  return (
    <main className="min-h-screenp-8 border">
        {/* Whiteboard Planning Section */}
        <div className="w-full">
          <WhiteboardPlanning bookingsData={bookingsData} teachersData={teachersData} />
        </div>
    </main>
  );
}
