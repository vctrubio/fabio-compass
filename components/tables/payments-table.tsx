/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_CONFIGS } from "@/config/entities";

interface PaymentsTableProps {
    payments: any[];
}

export default function PaymentsTable({ payments: paymentsData }: PaymentsTableProps) {
    try {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ENTITY_CONFIGS.payments.icon className="h-5 w-5" />
                        All Payments ({paymentsData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Amount</th>
                                    <th className="text-left p-3">Student</th>
                                    <th className="text-left p-3">Confirmation</th>
                                    <th className="text-left p-3">Transaction</th>
                                    <th className="text-left p-3">Kite Event</th>
                                    <th className="text-left p-3">Created</th>
                                    <th className="text-left p-3">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentsData.map((paymentData) => {
                                    const payment = paymentData.model;
                                    const relations = paymentData.relations as any;

                                    return (
                                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="text-sm font-medium font-mono">
                                                    €{(payment.amount / 100).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {relations.student ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{relations.student.name}</div>
                                                        <div className="text-xs text-muted-foreground">{relations.student.id.slice(0, 8)}...</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No student</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={payment.student_confirmation ? "default" : "outline"}>
                                                    {payment.student_confirmation ? 'Confirmed' : 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.transaction_id.slice(0, 8)}...
                                                </div>
                                                {relations.transaction && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Status: {relations.transaction.status}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {relations.kiteEvent ? (
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(relations.kiteEvent.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.kiteEvent.duration}min at {relations.kiteEvent.location}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No kite event</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {payment.created_at
                                                        ? new Date(payment.created_at).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {payment.updated_at
                                                        ? new Date(payment.updated_at).toLocaleDateString()
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

                    {paymentsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No payments found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering payments table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading payments data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
