'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingWithRelations } from '@/rails/types';
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import AdminBookings from './AdminBookings';
import AdminEvents from './AdminEvents';
import AdminStartingTime from './AdminStartingTime';
import AdminSlotBoard from './AdminSlotBoard';

interface AdminDashboardProps {
  allBookings: BookingWithRelations[];
}

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
  booking: BookingWithRelations;
  students: Array<{
    id: string;
    name: string;
  }>;
}


export default function AdminDashboard({ allBookings }: AdminDashboardProps) {
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Extract kite events from bookings relations
  const allKiteEvents = useMemo(() => {
    const events: any[] = [];

    allBookings.forEach(booking => {
      booking.relations.lessons?.forEach(lesson => {
        // Ensure we have the necessary teacher info before proceeding
        if (!lesson.teacher_id || !lesson.teacher?.name) {
          return; 
        }

        lesson.kiteEvents?.forEach(kiteEvent => {
          events.push({
            id: kiteEvent.id,
            date: kiteEvent.date,
            duration: kiteEvent.duration,
            location: kiteEvent.location,
            status: kiteEvent.status,
            lesson_id: kiteEvent.lesson_id,
            teacher: {
              id: lesson.teacher_id,
              name: lesson.teacher.name,
            },
            booking: booking, // Pass the whole booking for stats calculation
            students: booking.lambdas.students || [],
          });
        });
      });
    });
    
    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allBookings]);

  // Filter bookings based on selected date
  const filteredBookings = useMemo(() => {
    if (!selectedDate) return allBookings;
    
    return allBookings.filter((booking) => {
      const bookingStart = new Date(booking.model.date_start);
      const bookingEnd = new Date(booking.model.date_end);
      const filterDate = new Date(selectedDate);
      
      // Set time to start and end of day for comparison
      const filterDateStart = new Date(filterDate);
      filterDateStart.setHours(0, 0, 0, 0);
      
      const filterDateEnd = new Date(filterDate);
      filterDateEnd.setHours(23, 59, 59, 999);
      
      // Check if booking overlaps with selected date
      return bookingStart <= filterDateEnd && bookingEnd >= filterDateStart;
    });
  }, [allBookings, selectedDate]);

  // Filter kite events based on selected date
  const filteredKiteEvents = useMemo(() => {
    if (!selectedDate) return allKiteEvents;
    
    return allKiteEvents.filter((kiteEvent) => {
      const eventDate = new Date(kiteEvent.date);
      const filterDate = new Date(selectedDate);
      
      // Set time to start and end of day for comparison
      const filterDateStart = new Date(filterDate);
      filterDateStart.setHours(0, 0, 0, 0);
      
      const filterDateEnd = new Date(filterDate);
      filterDateEnd.setHours(23, 59, 59, 999);
      
      // Check if event date is within selected day
      return eventDate >= filterDateStart && eventDate <= filterDateEnd;
    });
  }, [allKiteEvents, selectedDate]);

  // Calculate stats for AdminStats component
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
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <AdminHeader selectedDate={selectedDate} />
        <AdminStartingTime filteredKiteEvents={filteredKiteEvents} />
        <AdminStats filteredKiteEvents={filteredKiteEvents} />
        <div className="grid grid-cols-1 gap-6 mt-6">
          <AdminBookings bookings={filteredBookings} selectedDate={selectedDate} filteredKiteEvents={filteredKiteEvents} />
        </div>
        <div className="mt-6">
          <AdminSlotBoard filteredKiteEvents={filteredKiteEvents} />
        </div>
      </div>
    </main>
  );
}
