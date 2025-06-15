import UsersTable from "@/components/tables/users-table";
import StudentsTable from "@/components/tables/students-table";
import TeachersTable from "@/components/tables/teachers-table";
import BookingsTable from "@/components/tables/bookings-table";
import CommissionsTable from "@/components/tables/commissions-table";
import EquipmentsTable from "@/components/tables/equipments-table";
import KiteEventsTable from "@/components/tables/kite-events-table";
import LessonsTable from "@/components/tables/lessons-table";
import PaymentsTable from "@/components/tables/payments-table";
import TransactionsTable from "@/components/tables/transactions-table";
import PackagesTable from "@/components/tables/packages-table";

interface MasterTableProps {
  users: any[];
  students: any[];
  teachers: any[];
  packages: any[];
  bookings: any[];
  lessons: any[];
  kiteEvents: any[];
  payments: any[];
  transactions: any[];
  commissions: any[];
  equipments: any[];
}

export default function MasterTable({
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
}: MasterTableProps) {
    return (
        <div className="space-y-6">
            <UsersTable users={users} />
            <StudentsTable students={students} />
            <TeachersTable teachers={teachers} />
            <PackagesTable packages={packages} />
            <BookingsTable bookings={bookings} />
            <LessonsTable lessons={lessons} />
            <KiteEventsTable kiteEvents={kiteEvents} />
            <PaymentsTable payments={payments} />
            <TransactionsTable transactions={transactions} />
            <CommissionsTable commissions={commissions} />
            <EquipmentsTable equipments={equipments} />
        </div>
    );
}