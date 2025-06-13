import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Transaction } from "@/drizzle/migrations/schema";
import { TransactionType } from "@/rails/model/TransactionModel";
import { DrizzleData } from "@/rails/types";

const transactionsWithRelations = {
  with: {
    kiteEvent: true,
  },
} as const;

function parseTransaction(transaction: any): DrizzleData<TransactionType> {
  const { kiteEvent, ...transactionModel } = transaction;

  return {
    model: transactionModel,
    relations: {
      kiteEvent,
    },
    lambdas: calculateLambdaValues(transaction),
  };
}

const transactionWithSort = {
  ...transactionsWithRelations,
  orderBy: desc(Transaction.created_at), // Sort by newest first
};

function calculateLambdaValues(transaction: any) {
  const kiteEvent = transaction.kiteEvent;
  
  // Calculate discount amount
  const discountAmount = transaction.model?.discount_rate 
    ? Math.round((transaction.model.amount * transaction.model.discount_rate) / 100)
    : 0;
  
  // Calculate final amount after discount
  const finalAmount = transaction.model?.amount 
    ? transaction.model.amount - discountAmount
    : 0;
  
  // Transaction status analysis
  const isCompleted = transaction.model?.status === 'completed';
  const isPending = transaction.model?.status === 'pending';
  const isFailed = transaction.model?.status === 'failed';
  const isCancelled = transaction.model?.status === 'cancelled';
  
  // Kite event information
  const kiteEventInfo = kiteEvent ? {
    id: kiteEvent.id,
    date: kiteEvent.date,
    hour: kiteEvent.hour,
    status: kiteEvent.status,
    duration: kiteEvent.duration,
    isCompleted: kiteEvent.status === 'completed',
  } : null;
  
  // Check if kite event is completed but transaction is not
  const hasEventStatusMismatch = kiteEvent?.status === 'completed' && !isCompleted;
  
  // Calculate transaction age in days
  const transactionAge = transaction.model?.created_at 
    ? Math.floor((new Date().getTime() - new Date(transaction.model.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Determine if transaction needs attention (pending for more than 7 days)
  const needsAttention = isPending && transactionAge > 7;

  return {
    discountAmount, // Amount saved due to discount
    finalAmount, // Final amount after discount
    isCompleted, // Boolean - transaction is completed
    isPending, // Boolean - transaction is pending
    isFailed, // Boolean - transaction failed
    isCancelled, // Boolean - transaction was cancelled
    kiteEventInfo, // Clean kite event object with computed status
    hasEventStatusMismatch, // Boolean - kite event completed but transaction not
    transactionAge, // Age in days
    needsAttention, // Boolean - pending transaction older than 7 days
  };
}

export async function drizzleTransactions(): Promise<DrizzleData<TransactionType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Transactions");
    const transactions = await db.query.Transaction.findMany(transactionWithSort);
    const result = transactions.map(parseTransaction);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Transactions");
    return result;
  } catch (error) {
    console.error("Error fetching transactions with Drizzle:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function drizzleTransactionById(
  id: string
): Promise<DrizzleData<TransactionType> | null> {
  try {
    const transaction = await db.query.Transaction.findFirst({
      where: eq(Transaction.id, id),
      ...transactionsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!transaction) {
      return null;
    }

    return parseTransaction(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID with Drizzle:", error);
    throw new Error("Failed to fetch transaction");
  }
}
