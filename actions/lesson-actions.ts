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
  newStatus: string,
  newDuration: number,
  continueTomorrow: boolean
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();

    console.log(
      "Updating lesson status and duration via Supabase:",
      lessonId,
      newStatus,
      newDuration,
      continueTomorrow
    );

    // Update lesson status
    const { error: lessonError } = await supabase
      .from("lesson")
      .update({ status: newStatus })
      .eq("id", lessonId);

    if (lessonError) {
      console.error("Supabase lesson status update error:", lessonError);
      return { success: false, error: lessonError.message };
    }

    // Update kite event duration
    const { error: kiteEventError } = await supabase
      .from("kite_event")
      .update({ duration: newDuration })
      .eq("lesson_id", lessonId);

    if (kiteEventError) {
      console.error("Supabase kite event duration update error:", kiteEventError);
      return { success: false, error: kiteEventError.message };
    }

    // If not continuing tomorrow, set kite event status to 'planned'
    if (!continueTomorrow) {
      const { error: kiteEventStatusError } = await supabase
        .from("kite_event")
        .update({ status: "planned" })
        .eq("lesson_id", lessonId);

      if (kiteEventStatusError) {
        console.error(
          "Supabase kite event status update error (planned):",
          kiteEventStatusError
        );
        return { success: false, error: kiteEventStatusError.message };
      }
    }

    console.log("Lesson and KiteEvent updated successfully.");
    return { success: true };
  });
}
