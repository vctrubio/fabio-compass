import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

interface BookingsTableProps {
    bookings: any[];
}

export default function BookingsTable({ bookings: bookingsData }: BookingsTableProps) {
    try {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.bookings.icon className="h-5 w-5" />
                        All Bookings ({bookingsData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Date Range</th>
                                    <th className="text-left p-3">Students</th>
                                    <th className="text-left p-3">Package</th>
                                    <th className="text-left p-3">Lessons</th>
                                    <th className="text-left p-3">Kite Events</th>
                                    <th className="text-left p-3">Signer</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookingsData.map((bookingData) => {
                                    const booking = bookingData.model;
                                    const relations = bookingData.relations as any;
                                    const lambdas = bookingData.lambdas as {
                                        students: any[];
                                        totalLessons: number;
                                        totalKiteEvents: number;
                                    };

                                    return (
                                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {new Date(booking.date_start).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    to {new Date(booking.date_end).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.students.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.students.length === 1 ? 'student' : 'students'}
                                                </div>
                                                {lambdas.students.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {lambdas.students.slice(0, 2).map(s => s.name).join(', ')}
                                                        {lambdas.students.length > 2 && ` +${lambdas.students.length - 2} more`}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {relations.package ? (
                                                    <div>
                                                        <div className="text-sm font-medium">
                                                            €{relations.package.price}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.package.duration}min, {relations.package.capacity} capacity
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No package</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.totalLessons}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.totalLessons === 1 ? 'lesson' : 'lessons'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.totalKiteEvents}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    kite events
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {booking.signer_pk ? booking.signer_pk.slice(0, 8) + '...' : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {booking.created_at
                                                        ? new Date(booking.created_at).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {bookingsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No bookings found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering bookings table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading bookings data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
