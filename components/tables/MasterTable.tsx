import UsersTable from "@/components/tables/users-table";
import StudentsTable from "@/components/tables/students-table";

export default function MasterTable() {
    return (
        <div className="space-y-6">
            <UsersTable />
            <StudentsTable />
        </div>
    );
}