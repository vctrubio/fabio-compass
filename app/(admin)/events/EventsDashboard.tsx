'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/pickers/month-picker";
import { KiteEventCsvData } from "@/rails/controller/KiteEventCsv";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { DropdownTag } from "@/rails/view/tag/DropdownTag";
import { getKiteEventStatusColor, updateKiteEventIdStatus } from "@/actions/enums";
import { KiteEventStatusEnum } from "@/rails/model/EnumModel";
import { toast } from "sonner";
import { internalActionTracker } from "@/providers/AdminProvider";

type SortOrder = 'asc' | 'desc';
type SortableEventField = keyof KiteEventCsvData;

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  planned: 'bg-blue-100 text-blue-800',
  plannedAuto: 'bg-purple-100 text-purple-800',
  teacherConfirmation: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800'
} as const;

function StatusDropdown({ 
  event, 
  onStatusUpdate 
}: { 
  event: KiteEventCsvData;
  onStatusUpdate: (eventId: string, newStatus: string) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const statusColor = event.status ? getKiteEventStatusColor(event.status) : undefined;

  // Monitor the internal action tracker to coordinate UI state
  useEffect(() => {
    let unmounted = false;
    let timer: NodeJS.Timeout | null = null;

    // Only set up monitoring if we're currently loading
    if (!isLoading) return;

    const checkComplete = () => {
      // Only proceed if the component is still mounted and we're in loading state
      if (unmounted) return;
      
      // If the action is no longer executing, that means the server action has completed
      if (!internalActionTracker.isExecuting()) {
        // Use a longer delay to ensure complete refresh
        timer = setTimeout(() => {
          if (!unmounted) {
            setIsLoading(false);
          }
        }, 800); // Longer delay to ensure router has completely refreshed
      } else {
        // Keep checking while action is executing
        timer = setTimeout(checkComplete, 100);
      }
    };
    
    // Start the checking process
    timer = setTimeout(checkComplete, 100);
    
    // Clean up on unmount or when loading state changes
    return () => {
      unmounted = true;
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  const handleStatusClick = async (newStatus: string) => {
    if (isLoading || newStatus === event.status) return;

    setIsLoading(true);
    try {
      await onStatusUpdate(event.event_id, newStatus);
    } catch (error) {
      console.error('Error updating event status:', error);
      setIsLoading(false);
    }
  };

  const statusOptions = KiteEventStatusEnum.options
    .filter(status => status !== 'plannedAuto')
    .map((status) => ({
      value: status,
      label: status,
      colorClass: getKiteEventStatusColor(status)
    }));

  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  return (
    <DropdownTag
      currentValue={event.status}
      options={statusOptions}
      onSelect={handleStatusClick}
      currentColorClass={statusColor!}
      disabled={isLoading}
    />
  );
}

function SortableHeader({ 
  children, 
  column, 
  sortBy, 
  sortOrder, 
  onSort 
}: { 
  children: React.ReactNode;
  column: string;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
}) {
  const getSortIcon = () => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <th 
      className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {children}
        {getSortIcon()}
      </div>
    </th>
  );
}

interface EventsDashboardProps {
  allEvents: KiteEventCsvData[];
}

interface EventsTableProps {
  events: KiteEventCsvData[];
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
  onStatusUpdate: (eventId: string, newStatus: string) => Promise<void>;
}

function EventsTable({ events, sortBy, sortOrder, onSort, onStatusUpdate }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No events found for this month.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <SortableHeader column="date" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Date
                </SortableHeader>
                <SortableHeader column="teacher_name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Teacher
                </SortableHeader>
                <SortableHeader column="start_time" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Start Time
                </SortableHeader>
                <SortableHeader column="duration" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Duration
                </SortableHeader>
                <SortableHeader column="location" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Location
                </SortableHeader>
                <th className="text-left p-4 font-medium">Students</th>
                <SortableHeader column="status" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                  Status
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={`${event.event_id}-${index}`} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4">{event.teacher_name}</td>
                  <td className="p-4">
                    {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </td>
                  <td className="p-4">{Math.round(event.duration / 60 * 10) / 10}h</td>
                  <td className="p-4">{event.location}</td>
                  <td className="p-4 text-sm">{event.students}</td>
                  <td className="p-4">
                    <StatusDropdown event={event} onStatusUpdate={onStatusUpdate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
    totalEvents: number;
    totalHours: number;
    uniqueStudents: number;
  };
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.totalHours}h</div>
          <p className="text-sm text-muted-foreground">Total Hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.uniqueStudents}</div>
          <p className="text-sm text-muted-foreground">Unique Students</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EventsDashboard({ allEvents }: EventsDashboardProps) {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Load selected month from localStorage on mount
  useEffect(() => {
    const savedMonth = localStorage.getItem('events-selected-month');
    if (savedMonth) {
      // Validate the month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (monthRegex.test(savedMonth)) {
        setSelectedMonth(savedMonth);
      }
    }
  }, []);

  // Save selected month to localStorage when it changes
  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
    localStorage.setItem('events-selected-month', month);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const handleStatusUpdate = useCallback(async (eventId: string, newStatus: string) => {
    console.log(`Event status update requested for ${eventId}: → ${newStatus}`);

    try {
      const eventToUpdate = {
        id: eventId,
        status: allEvents.find(e => e.event_id === eventId)?.status || 'planned'
      };

      const result = await updateKiteEventIdStatus(eventToUpdate, newStatus);

      if (!result.success) {
        console.error('Failed to update event status:', result.error);
        toast.error(`Failed to update event status: ${result.error}`);
        throw new Error(result.error);
      } else {
        console.log('Event status updated successfully:', result.data);
        toast.success('Event status updated successfully');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error(`Error updating event status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [allEvents]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = eventMonth === selectedMonth;
      
      // Search in teacher name and student names
      const matchesSearch = searchTerm === '' || 
        event.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.students.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof KiteEventCsvData];
      let bValue: any = b[sortBy as keyof KiteEventCsvData];

      // Handle date sorting
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle start time sorting (comparing time strings like "13:00" and "21:00")
      if (sortBy === 'start_time') {
        aValue = new Date(a.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        bValue = new Date(b.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allEvents, selectedMonth, searchTerm, sortBy, sortOrder]);

  // Calculate stats for filtered events
  const stats = useMemo(() => {
    const totalEvents = filteredAndSortedEvents.length;
    const totalDuration = filteredAndSortedEvents.reduce((sum, event) => sum + event.duration, 0);
    const totalHours = Math.round((totalDuration / 60) * 10) / 10;
    
    // Count unique students across all events
    const allStudents = new Set<string>();
    filteredAndSortedEvents.forEach(event => {
      if (event.students !== "No students") {
        event.students.split(", ").forEach(student => allStudents.add(student.trim()));
      }
    });
    
    return {
      totalEvents,
      totalHours,
      uniqueStudents: allStudents.size
    };
  }, [filteredAndSortedEvents]);

  return (
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl sm:text-3xl">Events</CardTitle>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Input
                  placeholder="Search by teacher or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72"
                />
                <MonthPicker 
                  selectedMonth={selectedMonth} 
                  onMonthChange={handleMonthChange} 
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <StatsCards stats={stats} />
        
        <EventsTable 
          events={filteredAndSortedEvents} 
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </main>
  );
}