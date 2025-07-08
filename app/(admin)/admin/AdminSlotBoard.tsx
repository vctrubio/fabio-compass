'use client';

interface AdminSlotBoardProps {
  filteredKiteEvents: any[];
}

export default function AdminSlotBoard({ filteredKiteEvents }: AdminSlotBoardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Debug: Raw Event Data</h2>
      <p>Event Count: {filteredKiteEvents.length}</p>
      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mt-4 text-xs overflow-auto">
        {JSON.stringify(filteredKiteEvents, null, 2)}
      </pre>
    </div>
  );
}