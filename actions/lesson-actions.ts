"use server";

import { createClient } from "@/lib/supabase/server";
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from "@/lib/action-wrapper";

export async function updateLessonStatus(
  lessonId: string,
  newStatus: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();

    console.log("Updating lesson status via Supabase:", lessonId, newStatus);

    const { data, error } = await supabase
      .from("lesson")
      .update({ status: newStatus })
      .eq("id", lessonId)
      .select();

    if (error) {
      console.error("Supabase lesson update error:", error);
      return { success: false, error: error.message };
    }

    console.log("Lesson status updated successfully:", data);
    return { success: true, data };
  });
}

export async function createLesson(
  bookingId: string,
  teacherId: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();

    console.log("Creating new lesson via Supabase:", { bookingId, teacherId });

    // Create a new lesson with 'planned' status
    const { data, error } = await supabase
      .from("lesson")
      .insert({
        booking_id: bookingId,
        teacher_id: teacherId,
        status: "planned",
      })
      .select();

    if (error) {
      console.error("Supabase lesson creation error:", error);
      return { success: false, error: error.message };
    }

    console.log("Lesson created successfully:", data);
    return { success: true, data };
  });
}
