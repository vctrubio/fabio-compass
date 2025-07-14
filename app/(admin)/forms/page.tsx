"use client";
import React, { useState } from "react";

import { StudentCreate4Admin } from "@/rails/forms/StudentCreate4Admin";
import { TeacherCreate4Admin } from "@/rails/forms/TeacherCreate4Admin";
import { BookingCreate4AdminForm } from "@/rails/forms/BookingCreate4Admin";
import { Button } from "@/components/ui/button";

export default function Page() {
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showTeacherForm, setShowTeacherForm] = useState(false);

    const handleStudentCreated = (studentData: any) => {
        console.log("Student created:", studentData);
        // Handle student creation success
        setShowStudentForm(false); // Hide form after creation
    };

    const handleTeacherCreated = (teacherData: any) => {
        console.log("Teacher created:", teacherData);
        // Handle teacher creation success
        setShowTeacherForm(false); // Hide form after creation
    };

    const handleBookingCreated = (bookingData: any) => {
        console.log("Booking created:", bookingData);
        // Handle booking creation success
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Always visible Booking Form */}
            <BookingCreate4AdminForm onSubmit={handleBookingCreated} />

            {/* Subheading for Student and Teacher forms */}
            <div className="text-center mt-8">
                <h3 className="text-xl mb-2">
                    <em>
                        To create a booking, you first need to create your students and/or
                        teachers.
                    </em>
                </h3>
                <p className="text-gray-500 text-sm">
                    A booking can exist without a teacher, but a lesson must be
                    created/assigned to a teacher in order to be able to create kite
                    events.
                </p>
            </div>

            {/* Buttons to toggle Student and Teacher forms */}
            <div className="flex justify-center gap-4 mt-4">
                <Button onClick={() => setShowStudentForm(!showStudentForm)}>
                    {showStudentForm ? "Hide Student Form" : "Add New Student"}
                </Button>
                <Button onClick={() => setShowTeacherForm(!showTeacherForm)}>
                    {showTeacherForm ? "Hide Teacher Form" : "Add New Teacher"}
                </Button>
            </div>

            {/* Conditionally rendered Student Form */}
            {showStudentForm && (
                <div className="mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Add New Student
                    </h2>
                    <StudentCreate4Admin onSubmit={handleStudentCreated} />
                </div>
            )}

            {/* Conditionally rendered Teacher Form */}
            {showTeacherForm && (
                <div className="mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Add New Teacher
                    </h2>
                    <TeacherCreate4Admin onSubmit={handleTeacherCreated} />
                </div>
            )}
        </div>
    );
}
