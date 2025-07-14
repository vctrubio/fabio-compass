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

export async function updateLessonStatusAndDuration(
  lessonId: string,
  newDuration: number,
  continueLessonTomorrow: boolean
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();

    console.log(
      "Updating lesson and kite event status and duration via Supabase:",
      lessonId,
      newDuration,
      continueLessonTomorrow
    );

    // Always update kite_event status to "completed"
    const { error: kiteEventStatusError } = await supabase
      .from("kite_event")
      .update({ status: "completed" })
      .eq("lesson_id", lessonId);

    if (kiteEventStatusError) {
      console.error("Supabase kite event status update error:", kiteEventStatusError);
      return { success: false, error: kiteEventStatusError.message };
    }

    // Update kite event duration
    const { error: kiteEventDurationError } = await supabase
      .from("kite_event")
      .update({ duration: newDuration })
      .eq("lesson_id", lessonId);

    if (kiteEventDurationError) {
      console.error("Supabase kite event duration update error:", kiteEventDurationError);
      return { success: false, error: kiteEventDurationError.message };
    }

    // Conditionally update lesson status based on continueLessonTomorrow
    if (!continueLessonTomorrow) {
      const { error: lessonStatusError } = await supabase
        .from("lesson")
        .update({ status: "planned" })
        .eq("id", lessonId);

      if (lessonStatusError) {
        console.error("Supabase lesson status update error:", lessonStatusError);
        return { success: false, error: lessonStatusError.message };
      }
    }

    console.log("Lesson and KiteEvent updated successfully.");
    return { success: true };
  });
}
