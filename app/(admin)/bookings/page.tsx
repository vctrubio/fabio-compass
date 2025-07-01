import { getBookingCsvData } from "@/rails/controller/BookingCsv";
import BookingsDashboard from "./BookingDashboard.tsx";

export default async function BookingsPage() {
  const allBookings = await getBookingCsvData();

  return <BookingsDashboard allBookings={allBookings} />;
}
