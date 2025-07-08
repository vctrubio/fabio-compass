import React from "react";
import { BookingWithRelations } from "@/rails/types";

interface AdminDebugPanelProps {
  filteredBookings: BookingWithRelations[];
}

export function AdminDebugPanel({ filteredBookings }: AdminDebugPanelProps) {
  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
      <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Admin Debug Panel</h4>
      <div className="max-h-60 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(filteredBookings, null, 2)}
        </pre>
      </div>
    </div>
  );
}
