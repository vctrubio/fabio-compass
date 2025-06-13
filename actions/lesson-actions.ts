'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Revalidation path constant
const REVALIDATE_PATH = "/fabio";

import { ApiAction } from "@/rails/types";

export async function updateLessonStatus(
  lessonId: string,
  newStatus: string
): Promise<ApiAction> {
  try {
    const supabase = await createClient();
    
    console.log('Updating lesson status via Supabase:', lessonId, newStatus);
    
    const { data, error } = await supabase
      .from('lesson')
      .update({ status: newStatus })
      .eq('id', lessonId)
      .select();

    if (error) {
      console.error('Supabase lesson update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Lesson status updated successfully:', data);

    // Revalidate the path to update the UI
    revalidatePath(REVALIDATE_PATH);

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating lesson status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
