'use server';

import { createClient } from '@/lib/supabase/server';
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from '@/lib/action-wrapper';
import { revalidatePath } from 'next/cache';

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

export async function createKiteEvent(data: {
  lesson_id: string;
  date: string;
  duration: number;
  location: 'Los Lances' | 'Valdevaqueros';
  status: 'planned' | 'completed' | 'teacherConfirmation' | 'plannedAuto';
}): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating kite event via Supabase:', data);
    
    const { data: kiteEvent, error } = await supabase
      .from('kite_event')
      .insert({
        lesson_id: data.lesson_id,
        date: data.date,
        duration: data.duration,
        location: data.location,
        status: data.status,
        trigger_transaction: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase kite event creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Kite event created successfully:', kiteEvent);
    return { success: true, data: kiteEvent };
  });
}

// New action for creating kite events with calculated time and plannedAuto status
export async function createKiteEventsWithCalculatedTimeAction(data: {
  lessons: Array<{
    lessonId: string;
    teacherId: string;
    calculatedTime: string; // The calculated time for this specific lesson
    duration: number; // Duration specific to this lesson
  }>;
  selectedDate: Date;
  location: 'Los Lances' | 'Valdevaqueros';
  selectedEquipmentIds: string[];
}) {
  return withInternalActionTracking(async () => {
    try {
      const { lessons, selectedDate, location, selectedEquipmentIds } = data;
      
      const createdEvents: any[] = [];
      const errors: string[] = [];

      console.log(`🎯 Creating ${lessons.length} kite events with calculated times and plannedAuto status`);

      // Create events for each lesson with their specific calculated time
      for (const lesson of lessons) {
        try {
          console.log(`Processing lesson ${lesson.lessonId.slice(-8)} with calculatedTime: ${lesson.calculatedTime}`);
          // Combine the selected date with the calculated time
          const [hours, minutes] = lesson.calculatedTime.split(':').map(Number);
          const eventDateTime = new Date(selectedDate);
          eventDateTime.setHours(hours, minutes, 0, 0);
          
          // Log the exact time being used to help debug time issues
          console.log(`  🕒 Event time details:`, {
            calculatedTime: lesson.calculatedTime,
            parsedHours: hours,
            parsedMinutes: minutes,
            dateTime: eventDateTime.toISOString(),
            localTime: eventDateTime.toLocaleTimeString()
          });
          
          const kiteEventData = {
            lesson_id: lesson.lessonId,
            date: eventDateTime.toISOString(),
            duration: lesson.duration,
            location: location,
            status: 'plannedAuto' as const,
          };

          console.log(`  📅 Creating event for lesson ${lesson.lessonId.slice(-8)} at ${lesson.calculatedTime} with duration ${lesson.duration}min`);

          // Create the kite event
          const result = await createKiteEvent(kiteEventData);
          
          if (result.success) {
            createdEvents.push(result.data);
          } else {
            throw new Error(result.error || 'Failed to create kite event');
          }
          
        } catch (error: any) {
          console.error(`Error creating event for lesson ${lesson.lessonId}:`, error);
          errors.push(`Lesson ${lesson.lessonId.slice(-8)}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        return { 
          success: false, 
          error: `Failed to create ${errors.length} event(s): ${errors.join(', ')}`,
          partialSuccess: createdEvents.length > 0,
          createdEvents 
        };
      }

      // Revalidate the page to refresh data
      revalidatePath('/admin/fabio');

      return { success: true, events: createdEvents };
    } catch (error: any) {
      console.error('Error creating kite events with calculated time:', error);
      return { success: false, error: error.message || 'Failed to create kite events' };
    }
  });
}
