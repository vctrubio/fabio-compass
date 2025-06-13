'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Revalidation path constant
const REVALIDATE_PATH = "/fabio";

import { ApiAction } from "@/rails/types";

export async function updateKiteEventStatus(
  kiteEventId: string,
  newStatus: string
): Promise<ApiAction> {
  try {
    const supabase = await createClient();
    
    console.log('Updating kite event status via Supabase:', kiteEventId, newStatus);
    
    const { data, error } = await supabase
      .from('kite_event')
      .update({ status: newStatus })
      .eq('id', kiteEventId)
      .select();

    if (error) {
      console.error('Supabase kite event update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Kite event status updated successfully:', data);

    // Revalidate the path to update the UI
    revalidatePath(REVALIDATE_PATH);

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating kite event status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
