/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzleLessons } from "@/rails/controller";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

export default async function LessonsTable() {
    try {
        const lessonsData = await drizzleLessons();

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.lessons.icon className="h-5 w-5" />
                        All Lessons ({lessonsData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Teacher</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Students</th>
                                    <th className="text-left p-3">Kite Events</th>
                                    <th className="text-left p-3">Package</th>
                                    <th className="text-left p-3">Total Hours</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessonsData.map((lessonData) => {
                                    const lesson = lessonData.model;
                                    const relations = lessonData.relations as any;
                                    const lambdas = lessonData.lambdas as {
                                        totalHours: number;
                                        studentsCount: number;
                                        kiteEventsCount: number;
                                        studentNames: string[];
                                    };

                                    return (
                                        <tr key={lesson.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                {relations.teacher ? (
                                                    <div>
                                                        <div className="font-medium">{relations.teacher.name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No teacher assigned</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    lesson.status === 'completed' ? 'default' :
                                                    lesson.status === 'ongoing' ? 'secondary' :
                                                    lesson.status === 'planned' ? 'outline' :
                                                    lesson.status === 'delegated' ? 'outline' : 'destructive'
                                                }>
                                                    {lesson.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.studentsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.studentsCount === 1 ? 'student' : 'students'}
                                                </div>
                                                {lambdas.studentNames.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {lambdas.studentNames.slice(0, 2).join(', ')}
                                                        {lambdas.studentNames.length > 2 && ` +${lambdas.studentNames.length - 2} more`}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.kiteEventsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.kiteEventsCount === 1 ? 'event' : 'events'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {relations.booking?.package ? (
                                                    <div>
                                                        <div className="text-sm font-medium">
                                                            €{relations.booking.package.price}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.booking.package.duration}min
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No package</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.totalHours}h
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    total time
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {lesson.created_at
                                                        ? new Date(lesson.created_at).toLocaleDateString()
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

                    {lessonsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No lessons found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering lessons table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading lessons data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
