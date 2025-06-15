import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

interface KiteEventsTableProps {
    kiteEvents: any[];
}

export default function KiteEventsTable({ kiteEvents: kiteEventsData }: KiteEventsTableProps) {
    try {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.kiteEvents.icon className="h-5 w-5" />
                        All Kite Events ({kiteEventsData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Duration</th>
                                    <th className="text-left p-3">Location</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Teacher</th>
                                    <th className="text-left p-3">Students</th>
                                    <th className="text-left p-3">Equipment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kiteEventsData.map((kiteEventData) => {
                                    const kiteEvent = kiteEventData.model;
                                    const relations = kiteEventData.relations as any;
                                    const lambdas = kiteEventData.lambdas as {
                                        studentsCount: number;
                                        equipmentCount: number;
                                        studentNames: string[];
                                        equipmentTypes: string[];
                                    };

                                    return (
                                        <tr key={kiteEvent.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {new Date(kiteEvent.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(kiteEvent.date).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {kiteEvent.duration}min
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {(kiteEvent.duration / 60).toFixed(1)}h
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {kiteEvent.location}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    kiteEvent.status === 'completed' ? 'default' :
                                                    kiteEvent.status === 'planned' ? 'secondary' :
                                                    kiteEvent.status === 'teacherConfirmation' ? 'outline' : 'destructive'
                                                }>
                                                    {kiteEvent.status}
                                                </Badge>
                                                {kiteEvent.trigger_transaction && (
                                                    <div className="text-xs text-green-600 mt-1">💰 Billable</div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {relations.lesson?.teacher ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{relations.lesson.teacher.name}</div>
                                                        <div className="text-xs text-muted-foreground">{relations.lesson.teacher.id.slice(0, 8)}...</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No teacher</span>
                                                )}
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
                                                    {lambdas.equipmentCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.equipmentCount === 1 ? 'item' : 'items'}
                                                </div>
                                                {lambdas.equipmentTypes.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {lambdas.equipmentTypes.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {kiteEventsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No kite events found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering kite events table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Kite Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading kite events data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
