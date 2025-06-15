import MasterTable from "@/components/tables/MasterTable";
import {
  getAllUsers,
  drizzleStudents,
  drizzleTeachers,
  drizzlePackages,
  drizzleBookings,
  drizzleLessons,
  drizzleKiteEvents,
  drizzlePayments,
  drizzleTransactions,
  drizzleCommissions,
  drizzleEquipments,
} from "@/rails/controller";

export default async function TablesPage() {
  // Fetch all data in parallel to avoid sequential async loading
  const [
    users,
    students,
    teachers,
    packages,
    bookings,
    lessons,
    kiteEvents,
    payments,
    transactions,
    commissions,
    equipments,
  ] = await Promise.all([
    getAllUsers(),
    drizzleStudents(),
    drizzleTeachers(),
    drizzlePackages(),
    drizzleBookings(),
    drizzleLessons(),
    drizzleKiteEvents(),
    drizzlePayments(),
    drizzleTransactions(),
    drizzleCommissions(),
    drizzleEquipments(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Tables</h1>
      <MasterTable 
        users={users}
        students={students}
        teachers={teachers}
        packages={packages}
        bookings={bookings}
        lessons={lessons}
        kiteEvents={kiteEvents}
        payments={payments}
        transactions={transactions}
        commissions={commissions}
        equipments={equipments}
      />
    </div>
  );
}