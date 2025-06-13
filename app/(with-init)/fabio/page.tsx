import { UsersIcon } from "@/assets/svg/UsersIcon";
import { drizzleBookings } from "@/rails/controller/BookingDrizzle";
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import WhiteboardPlanning from "@/components/hostelworld/whiteboard-planning";

export default async function FabioPage() {
  const bookingsData = await drizzleBookings();
  const teachersData = await drizzleTeachers();

  return (
    <main className="min-h-screenp-8 border">

        {/* <div className="flex flex-col items-center gap-6">
          <div className="p-8 border-2 border-slate-500 bg-transparent rounded-xl shadow-lg">
            <UsersIcon className="h-24 w-24 text-slate-700 dark:text-slate-200" />
          </div>
          <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-300">
            Fabio Portal
          </h1>
        </div> */}
        
        {/* Whiteboard Planning Section */}
        <div className="w-full">
          <WhiteboardPlanning bookingsData={bookingsData} teachersData={teachersData} />
        </div>
    </main>
  );
}
