"use client";

import React from "react";
import { KiteEventData } from "./types";
import { formatNumber } from "@/components/formatters";
import { TEACHER_SORT_ORDER } from "./whiteboard-teacher-order";

interface EventToCsvProps {
  kiteEvents: KiteEventData[];
}

export const EventToCsv: React.FC<EventToCsvProps> = ({ kiteEvents }) => {
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No kite events for this day to export.
        </h3>
      </div>
    );
  }

  return (
    <div
      id="csv-view-container"
      className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-4"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Teacher
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Students
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Start Time
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Duration (hrs)
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Price/hr (€)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedEvents.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {event.teacher.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {event.students.map((s) => s.name).join(", ")}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {event.time}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {event.location}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatNumber(event.duration / 60)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {event.pricePerHour
                    ? `${formatNumber(event.pricePerHour)}€`
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
