/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzleStudents } from "@/rails/controller/StudentDrizzle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguageBadge } from "@/components/getters";
import { ENTITY_CONFIGS } from "@/config/entities";

export default async function StudentsTable() {
    try {
        const studentsData = await drizzleStudents();

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.students.icon className="h-5 w-5" />
                        All Students ({studentsData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Languages</th>
                                    <th className="text-left p-3">Email / Role</th>
                                    <th className="text-left p-3">Bookings</th>
                                    <th className="text-left p-3">Lessons</th>
                                    <th className="text-left p-3">Kite Events</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsData.map((studentData) => {
                                    const student = studentData.model;
                                    const userWallet = (studentData.relations as any)?.userWallet;
                                    const lambdas = studentData.lambdas as {
                                        teachers: string[];
                                        bookingMinutes: number;
                                        kiteEventMinutes: number;
                                        kiteEventHours: number;
                                        lessonsCount: number;
                                        kiteEventsCount: number;
                                        bookingsCount: number;
                                    };

                                    return (
                                        <tr key={student.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-sm text-muted-foreground">{student.id}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap">
                                                    {student.languages && student.languages.length > 0
                                                        ? getLanguageBadge(student.languages)
                                                        : <span className="text-muted-foreground">No languages</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {userWallet?.email ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{userWallet.email}</div>
                                                        {userWallet.role && (
                                                            <Badge variant="outline" className="mt-1">{userWallet.role}</Badge>
                                                        )}
                                                    </div>
                                                ) : userWallet?.role ? (
                                                    <div>
                                                        <Badge variant="outline">{userWallet.role}</Badge>
                                                        <div className="text-xs text-muted-foreground mt-1">Role (No Email)</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No user wallet</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.bookingsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.bookingsCount === 1 ? 'booking' : 'bookings'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.lessonsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.lessonsCount === 1 ? 'lesson' : 'lessons'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.kiteEventsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.kiteEventHours}h total
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {student.created_at
                                                        ? new Date(student.created_at).toLocaleDateString()
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

                    {studentsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No students found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering students table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading students data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
