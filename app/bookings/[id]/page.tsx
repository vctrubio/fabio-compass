'use client'

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

interface BookingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  
  // Get booking data from URL search params (passed when navigating)
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ENTITY_CONFIGS.bookings.icon className="h-6 w-6" />
              Booking Details - ID: {resolvedParams.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Hello! You are in booking ID: {resolvedParams.id}
              </h1>
              
              {startDate && endDate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
                    Booking Period
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Start Date:</span>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {new Date(startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <span className="font-medium text-gray-600 dark:text-gray-400">End Date:</span>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {new Date(endDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Booking Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This is the detail page for booking {resolvedParams.id}. Additional booking details and actions will be implemented here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}