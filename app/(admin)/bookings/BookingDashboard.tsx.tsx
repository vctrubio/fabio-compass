'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/pickers/month-picker";
import { BookingCsvData } from "@/rails/controller/BookingCsv";

interface BookingsDashboardProps {
  allBookings: BookingCsvData[];
}

interface BookingsTableProps {
  bookings: BookingCsvData[];
}

function BookingsTable({ bookings }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No bookings found for this month.</p>
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
                <th className="text-left p-4 font-medium">Student Name</th>
                <th className="text-left p-4 font-medium">Package Description</th>
                <th className="text-left p-4 font-medium">Duration (hrs)</th>
                <th className="text-left p-4 font-medium">Price (€)</th>
                <th className="text-left p-4 font-medium">Lesson Count</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={`${booking.booking_id}-${index}`} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">{booking.student_name}</td>
                  <td className="p-4">{booking.package_description}</td>
                  <td className="p-4">{booking.package_duration}</td>
                  <td className="p-4">€{booking.package_price}</td>
                  <td className="p-4">{booking.lesson_count}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    totalBookings: number;
    totalDuration: number;
    totalPrice: number;
  };
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
          <p className="text-sm text-muted-foreground">Total Bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.totalDuration}h</div>
          <p className="text-sm text-muted-foreground">Total Hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">€{stats.totalPrice}</div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingsDashboard({ allBookings }: BookingsDashboardProps) {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Filter bookings by selected month (client-side filtering)
  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      const bookingMonth = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
      return bookingMonth === selectedMonth;
    });
  }, [allBookings, selectedMonth]);

  // Calculate stats for filtered bookings
  const stats = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const totalDuration = filteredBookings.reduce((sum, booking) => sum + booking.package_duration, 0);
    const totalPrice = filteredBookings.reduce((sum, booking) => sum + booking.package_price, 0);
    
    return {
      totalBookings,
      totalDuration: Math.round(totalDuration * 10) / 10,
      totalPrice
    };
  }, [filteredBookings]);

  return (
    <main className="min-h-screen w-full p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">Bookings</CardTitle>
              <MonthPicker 
                selectedMonth={selectedMonth} 
                onMonthChange={setSelectedMonth} 
              />
            </div>
          </CardHeader>
        </Card>

        <StatsCards stats={stats} />
        
        <BookingsTable bookings={filteredBookings} />
      </div>
    </main>
  );
}