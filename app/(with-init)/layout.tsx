import MasterTable from "@/components/tables/MasterTable";

export default function WithInitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6">
        <MasterTable />
        {children}
      </div>
    </div>
  );
}