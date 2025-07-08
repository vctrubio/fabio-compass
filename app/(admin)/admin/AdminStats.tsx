import { useMemo } from 'react';
import { formatDuration } from '@/components/formatters';

interface AdminStatsProps {
  filteredKiteEvents: any[];
}

export default function AdminStats({ filteredKiteEvents }: AdminStatsProps) {
  const statsData = useMemo(() => {
    const totalLessons = filteredKiteEvents.length;
    const totalMinutes = filteredKiteEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
    
    const totalRevenue = filteredKiteEvents.reduce((sum, event) => {
      const packagePrice = event.booking?.relations?.package?.price;
      const packageDuration = event.booking?.relations?.package?.duration;
      const eventDuration = event.duration;

      if (packagePrice && packageDuration && eventDuration && packageDuration > 0) {
        const revenueForEvent = (eventDuration / packageDuration) * packagePrice;
        return sum + revenueForEvent;
      }
      
      return sum;
    }, 0);

    return { totalLessons, totalMinutes, totalRevenue };
  }, [filteredKiteEvents]);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-green-600 dark:text-green-400 font-medium text-sm">Total Kite Lessons</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {statsData.totalLessons}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-blue-600 dark:text-blue-400 font-medium text-sm">Total Hours</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {formatDuration(statsData.totalMinutes)}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="text-yellow-600 dark:text-yellow-400 font-medium text-sm">Total Revenue</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
            €{statsData.totalRevenue.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
