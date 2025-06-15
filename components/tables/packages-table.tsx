import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

interface PackagesTableProps {
    packages: any[];
}

export default function PackagesTable({ packages: packagesData }: PackagesTableProps) {
    try {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.packages.icon className="h-5 w-5" />
                        All Packages ({packagesData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Description</th>
                                    <th className="text-left p-3">Price</th>
                                    <th className="text-left p-3">Duration</th>
                                    <th className="text-left p-3">Capacity</th>
                                    <th className="text-left p-3">Bookings</th>
                                    <th className="text-left p-3">Students</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packagesData.map((packageData) => {
                                    const packageModel = packageData.model;
                                    const lambdas = packageData.lambdas as {
                                        bookingsCount: number;
                                        studentsCount: number;
                                        lessonsCount: number;
                                        kiteEventsCount: number;
                                        teachersCount: number;
                                    };

                                    return (
                                        <tr key={packageModel.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">
                                                    {packageModel.description || "No description"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{packageModel.id}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-lg">€{packageModel.price}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    per package
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">
                                                    {Math.floor(packageModel.duration / 60)}h {packageModel.duration % 60}m
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {packageModel.duration} minutes
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-medium">
                                                    {packageModel.capacity} students
                                                </Badge>
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
                                                    {lambdas.studentsCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    unique {lambdas.studentsCount === 1 ? 'student' : 'students'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {packageModel.created_at
                                                        ? new Date(packageModel.created_at).toLocaleDateString()
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

                    {packagesData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No packages found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering packages table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.packages.icon className="h-5 w-5" />
                        Packages
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading packages data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
