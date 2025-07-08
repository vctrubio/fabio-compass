import { FlagIcon } from "lucide-react";
import { getTime } from "@/components/getters";

interface KiteEventFromBooking {
  id: string;
  lesson_id: string;
  date: string;
  duration: number;
  location: string;
  status: string;
  trigger_transaction: boolean;
  created_at?: string;
  lesson: any;
  booking: any;
  students: Array<{
    id: string;
    name: string;
  }>;
}

interface AdminStartingTimeProps {
  filteredKiteEvents: KiteEventFromBooking[];
}

export default function AdminStartingTime({ filteredKiteEvents }: AdminStartingTimeProps) {
  // Find the earliest time from filtered kite events
  const earliestTime = (() => {
    if (filteredKiteEvents.length === 0) return null;
    
    const times = filteredKiteEvents.map(event => {
      const eventDate = new Date(event.date);
      return getTime(eventDate);
    });
    
    // Sort times and return the earliest
    return times.sort()[0];
  })();

  if (!earliestTime) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex gap-1 items-center">
        <FlagIcon className="w-5 h-5" />
        {earliestTime}
      </div>
      <span className="text-sm text-blue-600 dark:text-blue-400">earliest</span>
    </div>
  );
}