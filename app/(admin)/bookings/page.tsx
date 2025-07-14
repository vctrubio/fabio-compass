import { getBookingCsvData } from "@/rails/controller/BookingCsv";
import BookingsDashboard from "./BookingDashboard";

export default async function BookingsPage() {
  const allBookings = await getBookingCsvData();

  return <BookingsDashboard allBookings={allBookings} />;
}
