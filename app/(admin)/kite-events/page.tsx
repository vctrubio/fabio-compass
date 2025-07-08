import React from 'react';
import Link from 'next/link';
import { drizzleKiteEventsSortedByDate } from '@/rails/controller/KiteEventDrizzle';
import { FormatDate } from '@/components/formatters';
import { KiteEventWithRelations } from '@/rails/types';
import { SingleDatePicker } from '@/components/pickers/single-date-picker';

interface KiteEventsPageProps {
  searchParams: {
    date?: string;
  };
}

export default async function KiteEventsPage({ searchParams }: KiteEventsPageProps) {
  const allKiteEvents: KiteEventWithRelations[] = await drizzleKiteEventsSortedByDate();
  const selectedDate = searchParams.date;

  // Filter kite events based on selected date if provided
  const filteredKiteEvents = selectedDate 
    ? allKiteEvents.filter((kiteEvent) => {
        const eventDate = new Date(kiteEvent.model.date);
        const filterDate = new Date(selectedDate);
        
        // Set time to start and end of day for comparison
        const filterDateStart = new Date(filterDate);
        filterDateStart.setHours(0, 0, 0, 0);
        
        const filterDateEnd = new Date(filterDate);
        filterDateEnd.setHours(23, 59, 59, 999);
        
        // Check if event date is within selected day
        return eventDate >= filterDateStart && eventDate <= filterDateEnd;
      })
    : allKiteEvents;

  const kiteEvents = filteredKiteEvents;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Kite Events</h1>
            <p className="text-gray-600 mt-2">
              {selectedDate 
                ? `Kite events for ${new Date(selectedDate).toLocaleDateString()}`
                : 'All kite events sorted by date'
              }
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <SingleDatePicker selectedDate={selectedDate} />
            {selectedDate && (
              <Link 
                href="/kite-events" 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors h-fit"
              >
                Clear Filter
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Kite Events ({kiteEvents.length})</h2>
          
          {kiteEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {selectedDate 
                  ? `No kite events found for ${new Date(selectedDate).toLocaleDateString()}`
                  : 'No kite events found.'
                }
              </p>
              {selectedDate && (
                <Link 
                  href="/kite-events" 
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  View All Kite Events
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {kiteEvents.map((kiteEvent) => (
                <Link 
                  key={kiteEvent.model.id} 
                  href={`/kite-events/${kiteEvent.model.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <FormatDate dateStr={kiteEvent.model.date} />
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {kiteEvent.model.id.slice(0, 8)}...
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Teacher:</h4>
                      <span className="text-sm text-gray-600">
                        {kiteEvent.relations.lesson?.teacher?.name || 'Not assigned'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Location:</h4>
                      <span className="text-sm text-gray-600">
                        {kiteEvent.model.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-1">Students ({kiteEvent.lambdas.studentsCount}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {kiteEvent.lambdas.studentNames.length > 0 ? (
                        kiteEvent.lambdas.studentNames.map((name, index) => (
                          <span 
                            key={index} 
                            className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No students assigned</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Duration: {kiteEvent.model.duration} minutes</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      kiteEvent.model.status === 'completed' ? 'bg-green-100 text-green-800' :
                      kiteEvent.model.status === 'teacherConfirmation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {kiteEvent.model.status}
                    </span>
                    <span>Equipment: {kiteEvent.lambdas.equipmentCount} items</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}