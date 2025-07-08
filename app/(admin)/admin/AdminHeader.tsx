import { Button } from "@/components/ui/button";
import { SingleDatePicker } from '@/components/pickers/single-date-picker';

interface AdminHeaderProps {
  selectedDate: string | null;
}

export default function AdminHeader({ selectedDate }: AdminHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2 items-end">
          <SingleDatePicker selectedDate={selectedDate} />
          {selectedDate && (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin'}
              className="h-fit"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}