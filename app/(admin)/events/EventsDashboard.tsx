'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/pickers/month-picker";
import { KiteEventCsvData } from "@/rails/controller/KiteEventCsv";

interface EventsDashboardProps {
  allEvents: KiteEventCsvData[];
}

interface EventsTableProps {
  events: KiteEventCsvData[];
}

function EventsTable({ events }: EventsTableProps) {
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
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Start Time</th>
                <th className="text-left p-4 font-medium">Duration</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Teacher</th>
                <th className="text-left p-4 font-medium">Students</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={`${event.event_id}-${index}`} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4">
                    {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </td>
                  <td className="p-4">{Math.round(event.duration / 60 * 10) / 10}h</td>
                  <td className="p-4">{event.location}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'plannedAuto' ? 'bg-purple-100 text-purple-800' :
                      event.status === 'teacherConfirmation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4">{event.teacher_name}</td>
                  <td className="p-4 text-sm">{event.students}</td>
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

  // Filter events by selected month (client-side filtering)
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      return eventMonth === selectedMonth;
    });
  }, [allEvents, selectedMonth]);

  // Calculate stats for filtered events
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const totalDuration = filteredEvents.reduce((sum, event) => sum + event.duration, 0);
    const totalHours = Math.round((totalDuration / 60) * 10) / 10;
    
    // Count unique students across all events
    const allStudents = new Set<string>();
    filteredEvents.forEach(event => {
      if (event.students !== "No students") {
        event.students.split(", ").forEach(student => allStudents.add(student.trim()));
      }
    });
    
    return {
      totalEvents,
      totalHours,
      uniqueStudents: allStudents.size
    };
  }, [filteredEvents]);

  return (
    <main className="min-h-screen w-full p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">Events</CardTitle>
              <MonthPicker 
                selectedMonth={selectedMonth} 
                onMonthChange={setSelectedMonth} 
              />
            </div>
          </CardHeader>
        </Card>

        <StatsCards stats={stats} />
        
        <EventsTable events={filteredEvents} />
      </div>
    </main>
  );
}