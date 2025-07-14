import React from "react";
import { Share, Mail } from "lucide-react";
import { KiteEventFromBooking } from "@/components/hostelworld/types";
import { formatDuration } from "@/components/formatters";

interface AdminShareEventsProps {
  filteredKiteEvents: KiteEventFromBooking[];
}

export function AdminShareEvents({
  filteredKiteEvents,
}: AdminShareEventsProps) {
  const handleCommunicate = () => {
    try {
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Get all students with their passport numbers from kite events
      const studentsWithPassports: Array<{
        name: string;
        passport?: string | null;
      }> = [];

      filteredKiteEvents.forEach((event) => {
        if (event.students && event.students.length > 0) {
          event.students.forEach((student) => {
            // Check if student already added
            if (!studentsWithPassports.find((s) => s.name === student.name)) {
              studentsWithPassports.push({
                name: student.name,
                passport: student.passport_number || null,
              });
            }
          });
        }
      });

      // Create email content
      let emailBody = `Tarifa Kite Hostel\n\n`;
      emailBody += `Selected Date: ${dateStr}\n`;
      emailBody += `Kite Classes: ${studentsWithPassports.length}\n\n`;

      if (studentsWithPassports.length > 0) {
        emailBody += `Student Details:\n`;
        studentsWithPassports.forEach((student, index) => {
          emailBody += `${index + 1}. ${student.name}`;
          if (student.passport) {
            emailBody += ` - Passport: ${student.passport}`;
          } else {
            emailBody += ` - Passport: Not provided`;
          }
          emailBody += `\n`;
        });
      } else {
        emailBody += `No students scheduled for kite events on this date.\n`;
      }

      // Create mailto URL
      const subject = encodeURIComponent(
        `Tarifa Kite Hostel - ${dateStr} Student Information`,
      );
      const body = encodeURIComponent(emailBody);
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

      // Open default email client
      window.location.href = mailtoUrl;
    } catch (error: any) {
      console.error("Error creating email:", error);
      alert("Error creating email");
    }
  };

  const handleShare = () => {
    try {
      const dateStr = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let scheduleText = `📅 ${dateStr} - Tarifa Kite Hostel Lesson Schedule\n\n`;

      // Group events by teacher
      const eventsByTeacher = filteredKiteEvents.reduce(
        (acc, event) => {
          const teacherName = event.teacher?.name || "Unknown Teacher";
          if (!acc[teacherName]) {
            acc[teacherName] = [];
          }
          acc[teacherName].push(event);
          return acc;
        },
        {} as Record<string, KiteEventFromBooking[]>,
      );

      Object.entries(eventsByTeacher).forEach(([teacherName, events]) => {
        scheduleText += `👨‍🏫 ${teacherName}:\n`;
        events.forEach((event) => {
          const durationFormatted = formatDuration(event.duration);
          const studentsText =
            event.students && event.students.length > 0
              ? event.students
                .map((student: any) => `⛑️ ${student.name}`)
                .join(", ")
              : "No students";

          scheduleText += `  • ${event.time} - ${durationFormatted} (${event.location || "No location"}) - ${studentsText}\n`;
        });
        scheduleText += "\n";
      });

      // Add summary
      const totalEvents = filteredKiteEvents.length;
      const totalDuration = filteredKiteEvents.reduce(
        (total: number, event: any) => total + event.duration,
        0,
      );
      const totalHoursFormatted = formatDuration(totalDuration);

      scheduleText += `📊 Summary:\n`;
      scheduleText += `Total Lessons: ${totalEvents}\n`;
      scheduleText += `Total Hours: ${totalHoursFormatted}\n`;

      if (navigator.share) {
        navigator.share({
          title: `${dateStr} - Lesson Schedule`,
          text: scheduleText,
        });
      } else {
        navigator.clipboard.writeText(scheduleText);
        alert("Schedule copied to clipboard!");
      }
    } catch (error: any) {
      console.error("Error sharing:", error);
      alert("Error sharing schedule");
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleCommunicate}
        className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
      >
        <Mail className="w-4 h-4" />
        Communicate
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
      >
        <Share className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
