import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionsTableProps {
    transactions: any[];
}

export default function TransactionsTable({ transactions: transactionsData }: TransactionsTableProps) {
    try {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions ({transactionsData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Amount</th>
                                    <th className="text-left p-3">Student</th>
                                    <th className="text-left p-3">Teacher</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Discount</th>
                                    <th className="text-left p-3">Kite Event</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsData.map((transactionData) => {
                                    const transaction = transactionData.model;
                                    const relations = transactionData.relations as any;
                                    const lambdas = transactionData.lambdas as {
                                        finalAmount: number;
                                        discountAmount: number;
                                    };

                                    return (
                                        <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="text-sm font-medium font-mono">
                                                    €{(transaction.amount / 100).toFixed(2)}
                                                </div>
                                                {transaction.discount_rate > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        Final: €{(lambdas.finalAmount / 100).toFixed(2)}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.student_id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.teacher_id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    transaction.status === 'completed' ? 'default' :
                                                    transaction.status === 'ongoing' ? 'secondary' :
                                                    transaction.status === 'planned' ? 'outline' : 'destructive'
                                                }>
                                                    {transaction.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {transaction.discount_rate > 0 ? (
                                                    <div>
                                                        <Badge variant="outline" className="text-green-600">
                                                            {transaction.discount_rate}%
                                                        </Badge>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            -€{(lambdas.discountAmount / 100).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No discount</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {relations.kiteEvent ? (
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(relations.kiteEvent.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {relations.kiteEvent.duration}min
                                                        </div>
                                                        <Badge variant="outline" className="text-xs mt-1">
                                                            {relations.kiteEvent.status}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No kite event</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {transaction.created_at
                                                        ? new Date(transaction.created_at).toLocaleDateString()
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

                    {transactionsData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No transactions found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering transactions table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading transactions data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
