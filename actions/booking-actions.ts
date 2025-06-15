'use server';

import { createClient } from '@/lib/supabase/server';
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from '@/lib/action-wrapper';
import { BookingForm, BookingMapToStudentForm } from '@/rails/model';
import { z } from 'zod';

export type BookingCreate4AdminFormData = z.infer<typeof BookingForm>;
export type BookingMapToStudentFormData = z.infer<typeof BookingMapToStudentForm>;

// Create booking (like server-compass createBookingFromClient)
export async function createBookingFromClient(
  bookingData: BookingCreate4AdminFormData & { signer_pk?: string }
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating booking via Supabase:', bookingData);
    
    const { data: booking, error } = await supabase
      .from('booking')
      .insert({
        package_id: bookingData.package_id,
        date_start: bookingData.date_start,
        date_end: bookingData.date_end,
        signer_pk: "9352027b-e9c5-4b2f-b6d6-375addd816ea", // Default signer_pk for admin
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase booking creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Booking created successfully:', booking);
    return { success: true, data: booking };
  });
}

// Create booking-student relationship (like server-compass createBookingMapStudent)
export async function createBookingMapStudent(
  mapData: BookingMapToStudentFormData
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating booking-student mapping via Supabase:', mapData);
    
    const { data: mapping, error } = await supabase
      .from('booking_student')
      .insert({
        booking_id: mapData.booking_id,
        student_id: mapData.student_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase booking-student mapping error:', error);
      return { success: false, error: error.message };
    }

    console.log('Booking-student mapping created successfully:', mapping);
    return { success: true, data: mapping };
  });
}

// Complete booking creation with student assignment (combines both operations)
export async function createBookingWithStudent(
  bookingData: BookingCreate4AdminFormData,
  studentId: string,
  signerPk?: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    console.log('Creating booking with student assignment:', { bookingData, studentId, signerPk });

    try {
      // 1. Create the booking
      const bookingCreateData = {
        ...bookingData,
        signer_pk: signerPk,
      };

      const bookingResult = await createBookingFromClient(bookingCreateData);
      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      const createdBooking = bookingResult.data;
      console.log('Booking created:', createdBooking);

      // 2. Create the booking-student relationship
      const mappingResult = await createBookingMapStudent({
        booking_id: createdBooking.id,
        student_id: studentId,
      });

      if (!mappingResult.success) {
        console.error('Failed to create booking-student mapping:', mappingResult.error);
        // Note: In a real transaction, we'd rollback the booking creation here
        // For now, we'll return the booking but note the mapping failed
        return {
          success: true,
          data: {
            booking: createdBooking,
            mapping: null,
            mappingError: mappingResult.error,
          },
          warning: 'Booking created but student mapping failed: ' + mappingResult.error
        };
      }

      console.log('Booking-student mapping created:', mappingResult.data);

      return {
        success: true,
        data: {
          booking: createdBooking,
          mapping: mappingResult.data,
        }
      };

    } catch (error: any) {
      console.error('Error in createBookingWithStudent:', error);
      return { success: false, error: error.message || 'Failed to create booking with student' };
    }
  });
}

// Get bookings for a specific student
export async function getBookingsByStudent(
  studentId: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Getting bookings for student:', studentId);

    try {
      const { data: bookings, error } = await supabase
        .from('booking_student')
        .select(`
          booking_id,
          student_id,
          booking:booking_id (
            id,
            package_id,
            date_start,
            date_end,
            signer_pk,
            created_at
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error('Error fetching student bookings:', error);
        return { success: false, error: error.message };
      }

      console.log('Student bookings fetched:', bookings);
      return { success: true, data: bookings };

    } catch (error: any) {
      console.error('Error in getBookingsByStudent:', error);
      return { success: false, error: error.message || 'Failed to get student bookings' };
    }
  });
}

// Get all bookings with related data
export async function getAllBookings(): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Getting all bookings');

    try {
      const { data: bookings, error } = await supabase
        .from('booking')
        .select(`
          id,
          package_id,
          date_start,
          date_end,
          signer_pk,
          created_at,
          booking_student (
            student_id,
            student:student_id (
              id,
              name,
              languages
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all bookings:', error);
        return { success: false, error: error.message };
      }

      console.log('All bookings fetched:', bookings?.length || 0);
      return { success: true, data: bookings };

    } catch (error: any) {
      console.error('Error in getAllBookings:', error);
      return { success: false, error: error.message || 'Failed to get all bookings' };
    }
  });
}

// Delete booking (and associated student mappings)
export async function deleteBooking(
  bookingId: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Deleting booking:', bookingId);

    try {
      // 1. Delete booking-student mappings first (foreign key constraint)
      const { error: mappingError } = await supabase
        .from('booking_student')
        .delete()
        .eq('booking_id', bookingId);

      if (mappingError) {
        console.error('Error deleting booking-student mappings:', mappingError);
        return { success: false, error: 'Failed to delete booking mappings: ' + mappingError.message };
      }

      // 2. Delete the booking
      const { data: deletedBooking, error: bookingError } = await supabase
        .from('booking')
        .delete()
        .eq('id', bookingId)
        .select()
        .single();

      if (bookingError) {
        console.error('Error deleting booking:', bookingError);
        return { success: false, error: bookingError.message };
      }

      console.log('Booking deleted successfully:', deletedBooking);
      return { success: true, data: deletedBooking };

    } catch (error: any) {
      console.error('Error in deleteBooking:', error);
      return { success: false, error: error.message || 'Failed to delete booking' };
    }
  });
}