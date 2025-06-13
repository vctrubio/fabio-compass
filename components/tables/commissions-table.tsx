/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzleCommissions } from "@/rails/controller";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CommissionsTable() {
    try {
        const commissionsData = await drizzleCommissions();

        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Commissions ({commissionsData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Amount</th>
                                    <th className="text-left p-3">Rate</th>
                                    <th className="text-left p-3">Teacher</th>
                                    <th className="text-left p-3">Student</th>
                                    <th className="text-left p-3">Confirmations</th>
                                    <th className="text-left p-3">Transaction</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissionsData.map((commissionData) => {
                                    const commission = commissionData.model;
                                    const relations = commissionData.relations as any;

                                    return (
                                        <tr key={commission.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="text-sm font-medium font-mono">
                                                    €{commission.amount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {commission.id ? commission.id.slice(0, 8) + '...' : 'No ID'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {commission.commission_rate}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {relations.teacher ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{relations.teacher.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.teacher.id ? relations.teacher.id.slice(0, 8) + '...' : 'No ID'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No teacher</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {relations.student ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{relations.student.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.student.id ? relations.student.id.slice(0, 8) + '...' : 'No ID'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No student</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Badge variant={commission.teacher_confirmation ? "default" : "outline"} className="text-xs">
                                                        Teacher: {commission.teacher_confirmation ? '✓' : '✗'}
                                                    </Badge>
                                                    <Badge variant={commission.admin_confirmation ? "default" : "outline"} className="text-xs">
                                                        Admin: {commission.admin_confirmation ? '✓' : '✗'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {commission.transaction_id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {commission.created_at
                                                        ? new Date(commission.created_at).toLocaleDateString()
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

                    {commissionsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No commissions found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering commissions table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading commissions data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
