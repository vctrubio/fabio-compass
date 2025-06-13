'use server';

import { createClient } from '@/lib/supabase/server';
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from '@/lib/action-wrapper';

export async function updateKiteEventStatus(
  kiteEventId: string,
  newStatus: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
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
    return { success: true, data };
  });
}
