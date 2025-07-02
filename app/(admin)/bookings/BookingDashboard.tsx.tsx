'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/pickers/month-picker";
import { BookingCsvData } from "@/rails/controller/BookingCsv";
import { ProgressBar, FormatDateRange } from "@/components/formatters";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortOrder = 'asc' | 'desc';
type SortableBookingField = keyof BookingCsvData;

interface BookingsDashboardProps {
  allBookings: BookingCsvData[];
}

interface BookingsTableProps {
  bookings: BookingCsvData[];
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
}

function BookingsTable({ bookings, sortBy, sortOrder, onSort }: BookingsTableProps) {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };
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
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
                  onClick={() => onSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
                  onClick={() => onSort('student_name')}
                >
                  <div className="flex items-center gap-2">
                    Student
                    {getSortIcon('student_name')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
                  onClick={() => onSort('package_description')}
                >
                  <div className="flex items-center gap-2">
                    Package
                    {getSortIcon('package_description')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
                  onClick={() => onSort('package_price')}
                >
                  <div className="flex items-center gap-2">
                    Price
                    {getSortIcon('package_price')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 select-none"
                  onClick={() => onSort('start_date')}
                >
                  <div className="flex items-center gap-2">
                    DateSpan
                    {getSortIcon('start_date')}
                  </div>
                </th>
                <th className="text-left p-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={`${booking.booking_id}-${index}`} className="border-b hover:bg-muted/30">
                  <td className="p-4 text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 font-medium">{booking.student_name}</td>
                  <td className="p-4">{booking.package_description}</td>
                  <td className="p-4">€{booking.package_price}</td>
                  <td className="p-4">
                    <FormatDateRange 
                      startDate={booking.start_date} 
                      endDate={booking.end_date} 
                    />
                  </td>
                  <td className="p-4">
                    <div className="min-w-[100px] max-w-[180px]">
                      <ProgressBar
                        usedMinutes={booking.used_minutes}
                        totalMinutes={booking.package_duration * 60}
                      />
                    </div>
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

  // Load selected month from localStorage on mount
  useEffect(() => {
    const savedMonth = localStorage.getItem('bookings-selected-month');
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
    localStorage.setItem('bookings-selected-month', month);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = allBookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      const bookingMonth = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = bookingMonth === selectedMonth;
      const matchesSearch = searchTerm === '' || booking.student_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMonth && matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof BookingCsvData];
      let bValue: any = b[sortBy as keyof BookingCsvData];

      // Handle date sorting
      if (sortBy === 'created_at' || sortBy === 'start_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
  }, [allBookings, selectedMonth, searchTerm, sortBy, sortOrder]);

  // Calculate stats for filtered bookings
  const stats = useMemo(() => {
    const totalBookings = filteredAndSortedBookings.length;
    const totalDuration = filteredAndSortedBookings.reduce((sum, booking) => sum + booking.package_duration, 0);
    const totalPrice = filteredAndSortedBookings.reduce((sum, booking) => sum + booking.package_price, 0);
    
    return {
      totalBookings,
      totalDuration: Math.round(totalDuration * 10) / 10,
      totalPrice
    };
  }, [filteredAndSortedBookings]);

  return (
    <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl sm:text-3xl">Bookings</CardTitle>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Input
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
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
        
        <BookingsTable 
          bookings={filteredAndSortedBookings} 
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </main>
  );
}