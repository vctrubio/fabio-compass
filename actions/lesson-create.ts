'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ApiAction } from '@/rails/types';

// Revalidation path constant
const REVALIDATE_PATH = "/fabio";

export async function createLesson(
  bookingId: string,
  teacherId: string
): Promise<ApiAction> {
  try {
    const supabase = await createClient();
    
    console.log('Creating new lesson via Supabase:', { bookingId, teacherId });
    
    // Create a new lesson with 'planned' status
    const { data, error } = await supabase
      .from('lesson')
      .insert({
        booking_id: bookingId,
        teacher_id: teacherId,
        status: 'planned'
      })
      .select();

    if (error) {
      console.error('Supabase lesson creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Lesson created successfully:', data);

    // Revalidate the path to update the UI
    revalidatePath(REVALIDATE_PATH);

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating lesson:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
