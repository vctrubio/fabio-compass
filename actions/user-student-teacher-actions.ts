'use server';

import { createClient } from '@/lib/supabase/server';
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from '@/lib/action-wrapper';
import { StudentWelcomeForm, TeacherForm } from '@/rails/model';
import { z } from 'zod';

export type StudentCreate4AdminFormData = z.infer<typeof StudentWelcomeForm>;
export type TeacherCreate4AdminFormData = z.infer<typeof TeacherForm>;

// Simple student creation without user account (like server-compass createStudenFromClient)
export async function createStudentFromClient(
  studentData: StudentCreate4AdminFormData
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating student via Supabase:', studentData);
    
    const { data: student, error } = await supabase
      .from('student')
      .insert({
        name: studentData.name,
        languages: studentData.languages,
        passport_number: studentData.passport_number,
        country: studentData.country,
        phone: studentData.phone,
        age: studentData.age,
        weight: studentData.weight,
        height: studentData.height,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase student creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Student created successfully:', student);
    return { success: true, data: student };
  });
}

// Student creation with invitation capability (like server-compass createStudentWelcomeForm)
export async function createStudentWithInvitation(
  authId: string | null,
  studentData: StudentCreate4AdminFormData,
  email?: string,
  role: 'student' | 'pendingStudent' = 'student'
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating student with invitation:', { studentData, email, role });

    try {
      // Start a transaction-like process
      
      // 1. First, create the student record
      const { data: student, error: studentError } = await supabase
        .from('student')
        .insert({
          name: studentData.name,
          languages: studentData.languages,
          passport_number: studentData.passport_number,
          country: studentData.country,
          phone: studentData.phone,
          age: studentData.age,
          weight: studentData.weight,
          height: studentData.height,
        })
        .select()
        .single();

      if (studentError) {
        console.error('Student creation error:', studentError);
        return { success: false, error: studentError.message };
      }

      console.log('Student created:', student);

      // 2. If email is provided, create or update user_wallet for invitation
      if (email) {
        // Check if user already exists with this email
        const { data: existingWallet } = await supabase
          .from('user_wallet')
          .select('*')
          .eq('email', email)
          .single();

        if (existingWallet) {
          // Update existing wallet to link to this student
          const { error: walletUpdateError } = await supabase
            .from('user_wallet')
            .update({
              role: role,
              pk: student.id, // Link to student ID
            })
            .eq('email', email);

          if (walletUpdateError) {
            console.error('Wallet update error:', walletUpdateError);
            // Rollback: delete the created student
            await supabase.from('student').delete().eq('id', student.id);
            return { success: false, error: 'Failed to update user wallet: ' + walletUpdateError.message };
          }

          console.log('Existing wallet updated for invitation');
        } else {
          // Create new user_wallet for invitation
          const { error: walletCreateError } = await supabase
            .from('user_wallet')
            .insert({
              role: role,
              email: email,
              sk: authId, // Will be null for admin invitations
              pk: student.id, // Link to student ID
              balance: 0,
            });

          if (walletCreateError) {
            console.error('Wallet creation error:', walletCreateError);
            // Rollback: delete the created student
            await supabase.from('student').delete().eq('id', student.id);
            return { success: false, error: 'Failed to create user wallet: ' + walletCreateError.message };
          }

          console.log('New wallet created for invitation');
        }
      }

      return { 
        success: true, 
        data: { 
          student,
          hasInvitation: !!email,
          invitationEmail: email,
          role: role
        } 
      };

    } catch (error: any) {
      console.error('Error in createStudentWithInvitation:', error);
      return { success: false, error: error.message || 'Failed to create student with invitation' };
    }
  });
}

// Link pending invitation when user authenticates (like server-compass linkPendingInvitation)
export async function linkPendingInvitation(
  authUserId: string,
  email: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Linking pending invitation for:', { authUserId, email });

    try {
      // Check for pending invitation
      const { data: pendingWallet, error: findError } = await supabase
        .from('user_wallet')
        .select('*')
        .eq('email', email)
        .eq('role', 'pendingStudent')
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error finding pending invitation:', findError);
        return { success: false, error: findError.message };
      }

      if (!pendingWallet) {
        console.log('No pending invitation found for:', email);
        return { success: true, data: { hasPendingInvitation: false } };
      }

      // Update the pending invitation to link with authenticated user
      const { data: updatedWallet, error: updateError } = await supabase
        .from('user_wallet')
        .update({
          sk: authUserId, // Link to authenticated user
          role: 'student', // Upgrade from pendingStudent to student
        })
        .eq('id', pendingWallet.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating pending invitation:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('Pending invitation linked successfully:', updatedWallet);
      
      return { 
        success: true, 
        data: { 
          hasPendingInvitation: true,
          linkedWallet: updatedWallet,
          studentId: pendingWallet.pk
        } 
      };

    } catch (error: any) {
      console.error('Error in linkPendingInvitation:', error);
      return { success: false, error: error.message || 'Failed to link pending invitation' };
    }
  });
}

// Get student by user wallet (for authenticated users)
export async function getStudentByAuth(
  authUserId: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Getting student by auth ID:', authUserId);

    try {
      // First get the user wallet
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallet')
        .select('*')
        .eq('sk', authUserId)
        .in('role', ['student', 'pendingStudent'])
        .single();

      if (walletError) {
        if (walletError.code === 'PGRST116') {
          return { success: true, data: null }; // No student found
        }
        console.error('Error finding user wallet:', walletError);
        return { success: false, error: walletError.message };
      }

      // If wallet found, get the student data
      if (wallet.pk) {
        const { data: student, error: studentError } = await supabase
          .from('student')
          .select('*')
          .eq('id', wallet.pk)
          .single();

        if (studentError) {
          console.error('Error finding student:', studentError);
          return { success: false, error: studentError.message };
        }

        return { 
          success: true, 
          data: { 
            student,
            wallet,
            role: wallet.role
          } 
        };
      }

      return { success: true, data: null };

    } catch (error: any) {
      console.error('Error in getStudentByAuth:', error);
      return { success: false, error: error.message || 'Failed to get student by auth' };
    }
  });
}

// Update student profile (for user-facing profile updates)
export async function updateStudentProfile(
  studentId: string,
  studentData: Partial<StudentCreate4AdminFormData>
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Updating student profile:', { studentId, studentData });

    const { data: student, error } = await supabase
      .from('student')
      .update({
        name: studentData.name,
        languages: studentData.languages,
        passport_number: studentData.passport_number,
        country: studentData.country,
        phone: studentData.phone,
        age: studentData.age,
        weight: studentData.weight,
        height: studentData.height,
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Student update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Student updated successfully:', student);
    return { success: true, data: student };
  });
}

// ========================================
// TEACHER CREATION FUNCTIONS
// ========================================

// Simple teacher creation without user account (like server-compass createTeacherFromClient)
export async function createTeacherFromClient(
  teacherData: TeacherCreate4AdminFormData
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating teacher via Supabase:', teacherData);
    
    const { data: teacher, error } = await supabase
      .from('teacher')
      .insert({
        name: teacherData.name,
        languages: teacherData.languages,
        passport_number: teacherData.passport_number,
        country: teacherData.country,
        phone: teacherData.phone,
        teacher_role: teacherData.teacher_role,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase teacher creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Teacher created successfully:', teacher);
    return { success: true, data: teacher };
  });
}

// Teacher creation with invitation capability (like server-compass createTeacherWelcomeForm)
export async function createTeacherWithInvitation(
  authId: string | null,
  teacherData: TeacherCreate4AdminFormData,
  email?: string,
  role: 'teacher' | 'pendingTeacher' = 'teacher'
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Creating teacher with invitation:', { teacherData, email, role });

    try {
      // Start a transaction-like process
      
      // 1. First, create the teacher record
      const { data: teacher, error: teacherError } = await supabase
        .from('teacher')
        .insert({
          name: teacherData.name,
          languages: teacherData.languages,
          passport_number: teacherData.passport_number,
          country: teacherData.country,
          phone: teacherData.phone,
          teacher_role: teacherData.teacher_role,
        })
        .select()
        .single();

      if (teacherError) {
        console.error('Teacher creation error:', teacherError);
        return { success: false, error: teacherError.message };
      }

      console.log('Teacher created:', teacher);

      // 2. If email is provided, create or update user_wallet for invitation
      if (email) {
        // Check if user already exists with this email
        const { data: existingWallet } = await supabase
          .from('user_wallet')
          .select('*')
          .eq('email', email)
          .single();

        if (existingWallet) {
          // Update existing wallet to link to this teacher
          const { error: walletUpdateError } = await supabase
            .from('user_wallet')
            .update({
              role: role,
              pk: teacher.id, // Link to teacher ID
            })
            .eq('email', email);

          if (walletUpdateError) {
            console.error('Wallet update error:', walletUpdateError);
            // Rollback: delete the created teacher
            await supabase.from('teacher').delete().eq('id', teacher.id);
            return { success: false, error: 'Failed to update user wallet: ' + walletUpdateError.message };
          }

          console.log('Existing wallet updated for teacher invitation');
        } else {
          // Create new user_wallet for invitation
          const { error: walletCreateError } = await supabase
            .from('user_wallet')
            .insert({
              role: role,
              email: email,
              sk: authId, // Will be null for admin invitations
              pk: teacher.id, // Link to teacher ID
              balance: 0,
            });

          if (walletCreateError) {
            console.error('Wallet creation error:', walletCreateError);
            // Rollback: delete the created teacher
            await supabase.from('teacher').delete().eq('id', teacher.id);
            return { success: false, error: 'Failed to create user wallet: ' + walletCreateError.message };
          }

          console.log('New wallet created for teacher invitation');
        }
      }

      return { 
        success: true, 
        data: { 
          teacher,
          hasInvitation: !!email,
          invitationEmail: email,
          role: role
        } 
      };

    } catch (error: any) {
      console.error('Error in createTeacherWithInvitation:', error);
      return { success: false, error: error.message || 'Failed to create teacher with invitation' };
    }
  });
}

// Get teacher by user wallet (for authenticated users)
export async function getTeacherByAuth(
  authUserId: string
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Getting teacher by auth ID:', authUserId);

    try {
      // First get the user wallet
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallet')
        .select('*')
        .eq('sk', authUserId)
        .in('role', ['teacher', 'pendingTeacher'])
        .single();

      if (walletError) {
        if (walletError.code === 'PGRST116') {
          return { success: true, data: null }; // No teacher found
        }
        console.error('Error finding user wallet:', walletError);
        return { success: false, error: walletError.message };
      }

      // If wallet found, get the teacher data
      if (wallet.pk) {
        const { data: teacher, error: teacherError } = await supabase
          .from('teacher')
          .select('*')
          .eq('id', wallet.pk)
          .single();

        if (teacherError) {
          console.error('Error finding teacher:', teacherError);
          return { success: false, error: teacherError.message };
        }

        return { 
          success: true, 
          data: { 
            teacher,
            wallet,
            role: wallet.role
          } 
        };
      }

      return { success: true, data: null };

    } catch (error: any) {
      console.error('Error in getTeacherByAuth:', error);
      return { success: false, error: error.message || 'Failed to get teacher by auth' };
    }
  });
}

// Update teacher profile (for user-facing profile updates)
export async function updateTeacherProfile(
  teacherId: string,
  teacherData: Partial<TeacherCreate4AdminFormData>
): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    console.log('Updating teacher profile:', { teacherId, teacherData });

    const { data: teacher, error } = await supabase
      .from('teacher')
      .update({
        name: teacherData.name,
        languages: teacherData.languages,
        passport_number: teacherData.passport_number,
        country: teacherData.country,
        phone: teacherData.phone,
        teacher_role: teacherData.teacher_role,
      })
      .eq('id', teacherId)
      .select()
      .single();

    if (error) {
      console.error('Teacher update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Teacher updated successfully:', teacher);
    return { success: true, data: teacher };
  });
}