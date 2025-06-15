'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { TeacherType } from "@/rails/model/TeacherModel";
import { StudentType } from "@/rails/model/StudentModel";
import { PackageStudentType } from "@/rails/model/PackageStudentModel";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { internalActionTracker } from "@/lib/internal-action-tracker";

// Export for use in actions (re-export from shared lib)
export { internalActionTracker };

interface AdminContextType {
    bookingsData: DrizzleData<BookingType>[];
    teachersData: DrizzleData<TeacherType>[];
    studentsData: DrizzleData<StudentType>[];
    packagesData: DrizzleData<PackageStudentType>[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
    children: ReactNode;
    bookingsData: DrizzleData<BookingType>[];
    teachersData: DrizzleData<TeacherType>[];
    studentsData: DrizzleData<StudentType>[];
    packagesData: DrizzleData<PackageStudentType>[];
}

export function AdminProvider({ children, bookingsData, teachersData, studentsData, packagesData }: AdminProviderProps) {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // Create a single subscription for ALL schema changes
        const allChangesChannel = supabase
            .channel('all-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: '*' // Listen to ALL tables
                },
                async (payload) => {
                    console.log('Database change detected:', payload);
                    
                    // Only refresh if we're NOT currently executing our own actions
                    if (!internalActionTracker.isExecuting()) {
                        // toast.info('External data change detected - refreshing...');
                        router.refresh();
                    } else {
                        console.log('Ignoring change during internal action execution');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(allChangesChannel);
        };
    }, [supabase, router]);

    return (
        <AdminContext.Provider value={{ bookingsData, teachersData, studentsData, packagesData }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
