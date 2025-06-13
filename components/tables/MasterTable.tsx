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

export default function MasterTable() {
    return (
        <div className="space-y-6">
            <UsersTable />
            <StudentsTable />
            <TeachersTable />
            <BookingsTable />
            <LessonsTable />
            <KiteEventsTable />
            <PaymentsTable />
            <TransactionsTable />
            <CommissionsTable />
            <EquipmentsTable />
        </div>
    );
}