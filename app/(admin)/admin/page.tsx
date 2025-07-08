import { drizzleBookingsSortedByDate } from '@/rails/controller/BookingDrizzle';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const allBookings = await drizzleBookingsSortedByDate();

  return <AdminDashboard allBookings={allBookings} />;
}