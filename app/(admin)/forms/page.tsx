'use client';
import React from 'react';

import { StudentCreate4Admin } from "@/rails/forms/StudentCreate4Admin";
import { TeacherCreate4Admin } from "@/rails/forms/TeacherCreate4Admin";
import { BookingCreate4AdminForm } from '@/rails/forms/BookingCreate4Admin';

export default function Page() {
    const handleStudentCreated = (studentData: any) => {
        console.log('Student created:', studentData);
        // Handle student creation success
    };

    const handleTeacherCreated = (teacherData: any) => {
        console.log('Teacher created:', teacherData);
        // Handle teacher creation success
    };

    const handleBookingCreated = (bookingData: any) => {
        console.log('Booking created:', bookingData);
        // Handle booking creation success
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[300px]">
                    <StudentCreate4Admin onSubmit={handleStudentCreated} />
                </div>
                <div className="flex-1 min-w-[300px]">
                    <TeacherCreate4Admin onSubmit={handleTeacherCreated} />
                </div>
            </div>
            <div>
                <BookingCreate4AdminForm onSubmit={handleBookingCreated} />
            </div>
        </div>
    );
}