'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HelmetIcon } from '@/assets/svg/HelmetIcon';
import { ALink } from '@/rails/view/link/ALink';
import { Loader2 } from 'lucide-react';
import { useAdmin, internalActionTracker } from '@/components/providers/AdminProvider';
import { addStudentToBooking } from '@/actions/booking-student-actions';

export interface StudentParams {
    id: string;
    name: string;
}

interface LinkStudentToBookingProps {
    bookingId: string;
    className?: string;
    currentStudentIds?: string[];
}

export function LinkStudentToBooking({ bookingId, className, currentStudentIds = [] }: LinkStudentToBookingProps) {
    const { studentsData } = useAdmin();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);

    // Convert students data to StudentParams format and filter out already assigned students
    const students: StudentParams[] = studentsData
        .filter(student => !currentStudentIds.includes(student.model.id))
        .map(student => ({
            id: student.model.id,
            name: student.model.name
        }));

    // Monitor the internal action tracker to coordinate UI state
    useEffect(() => {
        let unmounted = false;
        let timer: NodeJS.Timeout | null = null;

        // Only set up monitoring if we're currently loading
        if (!isLoading) return;

        const checkComplete = () => {
            // Only proceed if the component is still mounted and we're in loading state
            if (unmounted) return;

            // If the action is no longer executing, that means the server action has completed
            if (!internalActionTracker.isExecuting()) {
                // Use a longer delay to ensure complete refresh
                timer = setTimeout(() => {
                    if (!unmounted) {
                        setIsLoading(false);
                        setLoadingStudentId(null);
                    }
                }, 800); // Longer delay to ensure router has completely refreshed
            } else {
                // Keep checking while action is executing
                timer = setTimeout(checkComplete, 100);
            }
        };

        // Start the checking process
        timer = setTimeout(checkComplete, 100);

        // Clean up on unmount or when loading state changes
        return () => {
            unmounted = true;
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

    const handleAddStudent = async (studentId: string, studentName: string) => {
        if (isLoading) return;

        setIsLoading(true);
        setLoadingStudentId(studentId);
        console.log(`Adding student ${studentName} (${studentId}) to booking ${bookingId}`);

        try {
            const result = await addStudentToBooking(bookingId, studentId);

            if (!result.success) {
                console.error('Failed to add student:', result.error);
                toast.error(`Failed to add student: ${result.error}`);
                // Reset loading state for failures immediately
                setIsLoading(false);
                setLoadingStudentId(null);
            } else {
                console.log('Student added successfully:', result.data);
                // For success, don't reset loading state yet
                // The useEffect will handle it after the refresh completes
            }
        } catch (error) {
            console.error('Error adding student to booking:', error);
            toast.error(`Failed to add student: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Reset loading state for exceptions immediately
            setIsLoading(false);
            setLoadingStudentId(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isLoading}>
                <ALink
                    icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelmetIcon className="w-3.5 h-3.5" />}
                    className={`${className || ''} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xs font-medium">{isLoading ? 'Adding...' : 'Add Students'}</span>
                </ALink>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px] p-1">
                {students.length > 0 ? (
                    students.map((student) => (
                        <DropdownMenuItem
                            key={student.id}
                            onClick={() => handleAddStudent(student.id, student.name)}
                            className="text-sm hover:bg-transparent focus:bg-transparent p-1 cursor-pointer"
                            disabled={isLoading}
                        >
                            <span className="w-full inline-flex items-center justify-between text-xs font-medium rounded-md px-2 py-1.5 bg-orange-200 text-orange-900">
                                {loadingStudentId === student.id ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {student.name}
                                    </div>
                                ) : (
                                    student.name
                                )}
                            </span>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground p-1">
                        No available students
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
