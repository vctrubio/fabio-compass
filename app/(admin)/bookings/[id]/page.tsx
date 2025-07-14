import React from "react";
import { drizzleBookingById } from "@/rails/controller/BookingDrizzle";
import {
  FormatDateRange,
  ProgressBar,
  FormatDate,
  formatNumber,
} from "@/components/formatters";
import { BookingWithRelations } from "@/rails/types";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";

interface BookingHeaderProps {
  booking: BookingWithRelations;
}

function BookingHeader({ booking }: BookingHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <div className="mt-2">
          <FormatDateRange
            startDate={booking.model.date_start}
            endDate={booking.model.date_end}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
        <span>ID: {booking.model.id}</span>
        <span>
          Created: {new Date(booking.model.created_at).toLocaleDateString()}
        </span>
        {booking.model.signer_pk && (
          <span>Signer PK: {booking.model.signer_pk}</span>
        )}
      </div>
    </div>
  );
}

interface PackageDetailsProps {
  booking: BookingWithRelations;
  usedMinutes: number;
  totalMinutes: number;
}

function PackageDetails({
  booking,
  usedMinutes,
  totalMinutes,
}: PackageDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Package Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <h4 className="font-medium text-gray-800">Description</h4>
          <p className="text-gray-600">
            {booking.relations.package?.description || "N/A"}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Duration</h4>
          <p className="text-gray-600">
            {(booking.relations.package?.duration || 0) / 60} hours
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Price</h4>
          <p className="text-gray-600">
            €{booking.relations.package?.price || 0}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Capacity</h4>
          <p className="text-gray-600">
            {booking.relations.package?.capacity || "N/A"}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">Progress</h4>
        <ProgressBar usedMinutes={usedMinutes} totalMinutes={totalMinutes} />
      </div>
      {booking.relations.package?.price &&
      booking.relations.package?.duration ? (
        <div className="mt-4 flex gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Price per Hour</h4>
            <p className="text-gray-600">
              €
              {(() => {
                const price = (booking.relations.package.price / booking.relations.package.duration) * 60;
                return Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2);
              })()}
            </p>
          </div>
          {(booking.relations.package?.capacity || 0) > 1 ? (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Price per Group</h4>
              <p className="text-gray-600">
                €
                {(() => {
                  const price = ((booking.relations.package.price / booking.relations.package.duration) * 60) * (booking.relations.package.capacity || 1);
                  return Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2);
                })()}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface StudentListProps {
  students: BookingWithRelations["lambdas"]["students"];
}

function StudentList({ students }: StudentListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Students ({students.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((student) => (
          <div key={student.id} className="border rounded-lg p-4">
            <h3 className="font-medium text-lg">{student.name}</h3>
            <p className="text-sm text-gray-600">ID: {student.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KiteEventsTableProps {
  lessons: BookingWithRelations["relations"]["lessons"];
}

function KiteEventsTable({ lessons }: KiteEventsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-left p-4 font-medium">Duration (h)</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Teacher</th>
              <th className="text-left p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {lessons?.map((lesson) =>
              lesson.kiteEvents
                ?.sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
                )
                .map((event) => (
                  <tr key={event.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <FormatDate dateStr={event.date} />
                    </td>
                    <td className="p-4">
                      {formatNumber((event.duration || 0) / 60)}
                    </td>
                    <td className="p-4">{event.location || "N/A"}</td>
                    <td className="p-4 flex items-center gap-2">
                      <HeadsetIcon className="w-5 h-5 text-gray-600" />
                      {lesson.teacher?.name || "Not assigned"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          lesson.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : lesson.status === "ongoing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </td>
                  </tr>
                )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const bookingId = params.id;

  const booking: BookingWithRelations | null =
    await drizzleBookingById(bookingId);

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Booking Not Found</h1>
          <p className="text-gray-600 mt-2">
            The booking with ID {bookingId} does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Calculate used minutes from kite events
  const usedMinutes =
    booking.relations.lessons?.reduce((sum, lesson) => {
      return (
        sum +
        (lesson.kiteEvents?.reduce(
          (eventSum, event) => eventSum + (event.duration || 0),
          0,
        ) || 0)
      );
    }, 0) || 0;

  const totalMinutes = booking.relations.package?.duration || 0;

  return (
    <div className="container mx-auto p-6">
      <BookingHeader booking={booking} />

      <div className="space-y-6">
        <PackageDetails
          booking={booking}
          usedMinutes={usedMinutes}
          totalMinutes={totalMinutes}
        />
        <StudentList students={booking.lambdas.students} />
        <KiteEventsTable lessons={booking.relations.lessons} />
      </div>
    </div>
  );
}
