"use client";

import React from "react";
import { KiteEventData } from "./types";
import { formatNumber } from "@/components/formatters";
import { Printer } from "lucide-react";

const TEACHER_SORT_ORDER = ["Matteo", "Chantal", "Ricardo", "Victor", "Fabio"];

interface EventToCsvProps {
  kiteEvents: KiteEventData[];
  selectedDate: Date;
}

export const EventToCsv: React.FC<EventToCsvProps> = ({ kiteEvents, selectedDate }) => {
  const handlePrint = () => {
    const dateStr = selectedDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const originalTitle = document.title;
    document.title = `Kite Schedule - ${dateStr}`;

    const style = document.createElement("style");
    style.textContent = `
        @media print {
            body * {
                visibility: hidden;
            }
            #event-to-csv-container, #event-to-csv-container * {
                visibility: visible;
            }
            #event-to-csv-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
            }
            .print-hidden {
                display: none !important;
            }
            #event-to-csv-container::before {
                content: "Kite Schedule for ${dateStr}";
                display: block;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                color: black !important;
            }
            @page {
                size: A4 portrait;
                margin: 1cm;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                color: black !important;
            }
            th {
                background-color: #f2f2f2 !important;
            }
        }
    `;
    document.head.appendChild(style);

    window.print();

    document.head.removeChild(style);
    document.title = originalTitle;
  };

  const sortedEvents = [...kiteEvents].sort((a, b) => {
    const aIndex = TEACHER_SORT_ORDER.indexOf(a.teacher.name);
    const bIndex = TEACHER_SORT_ORDER.indexOf(b.teacher.name);

    if (aIndex === -1 && bIndex === -1) {
      return a.teacher.name.localeCompare(b.teacher.name); // Both not in list, sort alphabetically
    }
    if (aIndex === -1) {
      return 1; // a is not in the list, so it comes after b
    }
    if (bIndex === -1) {
      return -1; // b is not in the list, so it comes after a
    }
    return aIndex - bIndex; // Sort based on the index in the list
  });

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Schedule Export</h3>
            <p className="text-gray-500 dark:text-gray-400">No kite events for this day to export.</p>
        </div>
    );
  }

  return (
    <div id="event-to-csv-container" className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4 print-hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Schedule Export</h3>
        <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
          <Printer className="w-4 h-4" />
          Print Schedule
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teacher</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Time</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration (hrs)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price/hr (€)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedEvents.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.teacher.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {event.students.map((s) => s.name).join(", ")}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.time}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.location}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatNumber(event.duration / 60)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.pricePerHour ? `${formatNumber(event.pricePerHour)}€` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
