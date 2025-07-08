import React from 'react';
import { drizzleKiteEventById } from '@/rails/controller/KiteEventDrizzle';
import { FormatDate } from '@/components/formatters';
import { KiteEventWithRelations } from '@/rails/types';

interface KiteEventPageProps {
  params: {
    id: string;
  };
}

export default async function KiteEventPage({ params }: KiteEventPageProps) {
  const kiteEventId = params.id;
  
  const kiteEvent: KiteEventWithRelations | null = await drizzleKiteEventById(kiteEventId);

  if (!kiteEvent) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Kite Event Not Found</h1>
          <p className="text-gray-600 mt-2">The kite event with ID {kiteEventId} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kite Event Details</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>ID: {kiteEvent.model.id}</span>
          <span>Created: {new Date(kiteEvent.model.created_at || '').toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Duration</h3>
          <p className="text-2xl font-bold text-blue-600">{kiteEvent.model.duration} min</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Students</h3>
          <p className="text-2xl font-bold text-green-600">{kiteEvent.lambdas.studentsCount}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Equipment</h3>
          <p className="text-2xl font-bold text-purple-600">{kiteEvent.lambdas.equipmentCount}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Status</h3>
          <p className="text-2xl font-bold text-orange-600">{kiteEvent.model.status}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800">Date & Time</h4>
              <FormatDate dateStr={kiteEvent.model.date} />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Location</h4>
              <p className="text-gray-600">{kiteEvent.model.location}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Duration</h4>
              <p className="text-gray-600">{kiteEvent.model.duration} minutes</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Transaction Trigger</h4>
              <p className="text-gray-600">{kiteEvent.model.trigger_transaction ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Teacher Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Teacher</h2>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg">{kiteEvent.relations.lesson?.teacher?.name || 'Not assigned'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <h4 className="font-medium text-gray-800">Role</h4>
                <p className="text-gray-600">{kiteEvent.relations.lesson?.teacher?.teacher_role || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Languages</h4>
                <p className="text-gray-600">{kiteEvent.relations.lesson?.teacher?.languages?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Phone</h4>
                <p className="text-gray-600">{kiteEvent.relations.lesson?.teacher?.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Country</h4>
                <p className="text-gray-600">{kiteEvent.relations.lesson?.teacher?.country || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Students ({kiteEvent.lambdas.studentsCount})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kiteEvent.relations.lesson?.booking?.bookingStudents?.map((bookingStudent) => (
              <div key={bookingStudent.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">{bookingStudent.student.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <p>Languages: {bookingStudent.student.languages?.join(', ') || 'N/A'}</p>
                  <p>Phone: {bookingStudent.student.phone || 'N/A'}</p>
                  <p>Country: {bookingStudent.student.country || 'N/A'}</p>
                  {bookingStudent.student.age && <p>Age: {bookingStudent.student.age}</p>}
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No students assigned to this kite event.</p>
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Equipment ({kiteEvent.lambdas.equipmentCount})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kiteEvent.relations.equipmentItems?.map((equipment) => (
              <div key={equipment.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">{equipment.model}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <p>Type: {equipment.type}</p>
                  <p>Serial: {equipment.serial_id}</p>
                  <p>Size: {equipment.size}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No equipment assigned to this kite event.</p>
            )}
          </div>
        </div>

        {/* Booking Information */}
        {kiteEvent.relations.booking && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Related Booking</h2>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg">Booking {kiteEvent.relations.booking.id.slice(0, 8)}...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-medium text-gray-800">Package</h4>
                  <p className="text-gray-600">{kiteEvent.relations.booking.package?.description || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Package Price</h4>
                  <p className="text-gray-600">€{kiteEvent.relations.booking.package?.price || 0}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Booking Period</h4>
                  <p className="text-gray-600">
                    {new Date(kiteEvent.relations.booking.date_start).toLocaleDateString()} - {new Date(kiteEvent.relations.booking.date_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Capacity</h4>
                  <p className="text-gray-600">{kiteEvent.relations.booking.package?.capacity || 0} students</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}