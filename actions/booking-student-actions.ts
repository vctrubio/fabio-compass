"use server";

import { createClient } from "@/lib/supabase/server";
import { withInternalActionTracking } from '@/lib/action-wrapper';

export async function addStudentToBooking(bookingId: string, studentId: string) {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Adding student ${studentId} to booking ${bookingId}`);

    // Insert the booking-student relationship
    const { data, error } = await supabase
      .from('booking_student')
      .insert({
        booking_id: bookingId,
        student_id: studentId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding student to booking:", error);
      
      // Handle duplicate entry error
      if (error.code === '23505') {
        return { success: false, error: "Student is already added to this booking" };
      }
      
      return { success: false, error: error.message };
    }

    console.log("Student added to booking successfully:", data);
    return { success: true, data };
  });
}
