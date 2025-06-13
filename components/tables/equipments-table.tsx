/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzleEquipments } from "@/rails/controller";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EquipmentsTable() {
    try {
        const equipmentsData = await drizzleEquipments();

        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Equipment ({equipmentsData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Serial ID</th>
                                    <th className="text-left p-3">Type</th>
                                    <th className="text-left p-3">Model</th>
                                    <th className="text-left p-3">Size</th>
                                    <th className="text-left p-3">Kite Events</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipmentsData.map((equipmentData) => {
                                    const equipment = equipmentData.model;
                                    const relations = equipmentData.relations as any;
                                    const lambdas = equipmentData.lambdas as {
                                        kiteEventCount: number;
                                    };

                                    return (
                                        <tr key={equipment.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">{equipment.serial_id}</div>
                                                <div className="text-sm text-muted-foreground">{equipment.id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {equipment.type}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">{equipment.model}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {equipment.size}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {equipment.type === 'Kite' ? 'm²' : 'cm'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.kiteEventCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.kiteEventCount === 1 ? 'event' : 'events'}
                                                </div>
                                                {relations.kiteEvents && relations.kiteEvents.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Latest: {new Date(relations.kiteEvents[0].date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={lambdas.kiteEventCount > 0 ? "default" : "secondary"}>
                                                    {lambdas.kiteEventCount > 0 ? "In Use" : "Available"}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {equipment.created_at
                                                        ? new Date(equipment.created_at).toLocaleDateString()
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

                    {equipmentsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No equipment found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering equipment table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading equipment data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
