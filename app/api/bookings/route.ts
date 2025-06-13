import { drizzleBookings, drizzleBookingById } from "@/rails/controller/BookingDrizzle";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Fetch specific booking by ID
      const booking = await drizzleBookingById(id);
      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: booking });
    } else {
      // Fetch all bookings
      const bookings = await drizzleBookings();
      return NextResponse.json({ success: true, data: bookings });
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
