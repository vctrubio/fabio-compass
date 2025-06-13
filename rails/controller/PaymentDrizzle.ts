import db from "@/drizzle";
import { eq, desc, like, or, ilike } from "drizzle-orm";
import { Payment } from "@/drizzle/migrations/schema";
import { PaymentType } from "@/rails/model/PaymentModel";
import { DrizzleData } from "@/rails/types";

const paymentsWithRelations = {
  with: {
    transaction: {
      with: {
        student: true,
        kiteEvent: true,
        lesson: {
          with: {
            booking: true,
          },
        },
        booking: true,
        package: true,
        teacher: true,
      },
    },
  },
} as const;

function parsePayment(payment: any): DrizzleData<PaymentType> {
  const { transaction, ...paymentModel } = payment;

  return {
    model: paymentModel,
    relations: {
      transaction,
      student: transaction?.student || null,
      kiteEvent: transaction?.kiteEvent || null,
    },
    lambdas: calculateLambdaValues(payment),
  };
}

const paymentWithSort = {
  ...paymentsWithRelations,
  orderBy: desc(Payment.created_at), // Sort by newest first
};

function calculateLambdaValues(payment: any) {
  const transaction = payment.transaction;
  
  // Payment status based on student confirmation
  const paymentStatus = payment.model?.student_confirmation ? 'confirmed' : 'pending';
  
  // Calculate discount amount if there's a discount rate
  const discountAmount = transaction?.amount && transaction?.discount_rate 
    ? Math.round((transaction.amount * transaction.discount_rate) / 100)
    : 0;
  
  // Calculate final amount after discount
  const finalAmount = transaction?.amount 
    ? transaction.amount - discountAmount
    : payment.model?.amount || 0;
  
  // Check if payment amount matches transaction amount
  const isAmountMatching = payment.model?.amount === finalAmount;
  
  // Get lesson details
  const lessonInfo = transaction?.lesson ? {
    id: transaction.lesson.id,
    date_start: transaction.lesson.date_start,
    date_end: transaction.lesson.date_end,
    teacher_name: transaction.teacher?.name || 'Unknown',
  } : null;
  
  // Get kite event details
  const kiteEventInfo = transaction?.kiteEvent ? {
    id: transaction.kiteEvent.id,
    date: transaction.kiteEvent.date,
    hour: transaction.kiteEvent.hour,
    status: transaction.kiteEvent.status,
    duration: transaction.kiteEvent.duration,
  } : null;
  
  // Get student details
  const studentInfo = transaction?.student ? {
    id: transaction.student.id,
    name: transaction.student.name,
    email: transaction.student.email,
  } : null;
  
  // Get booking details
  const bookingInfo = transaction?.booking ? {
    id: transaction.booking.id,
    date_start: transaction.booking.date_start,
    date_end: transaction.booking.date_end,
  } : null;

  return {
    paymentStatus, // 'confirmed' or 'pending'
    discountAmount, // Amount saved due to discount
    finalAmount, // Final amount after discount
    isAmountMatching, // Whether payment amount matches transaction amount
    studentInfo, // Clean student object with id, name, email
    lessonInfo, // Lesson details with teacher name
    kiteEventInfo, // Kite event details
    bookingInfo, // Booking date range
  };
}

export async function drizzlePayments(): Promise<DrizzleData<PaymentType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Payments");
    const payments = await db.query.Payment.findMany(paymentWithSort);
    const result = payments.map(parsePayment);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Payments");
    return result;
  } catch (error) {
    console.error("Error fetching payments with Drizzle:", error);
    throw new Error("Failed to fetch payments");
  }
}

export async function drizzlePaymentById(
  id: string
): Promise<DrizzleData<PaymentType> | null> {
  try {
    const payment = await db.query.Payment.findFirst({
      where: eq(Payment.id, id),
      ...paymentsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!payment) {
      return null;
    }

    return parsePayment(payment);
  } catch (error) {
    console.error("Error fetching payment by ID with Drizzle:", error);
    throw new Error("Failed to fetch payment");
  }
}

export async function drizzlePaymentsWithSearch(searchTerm?: string): Promise<DrizzleData<PaymentType>[]> {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return drizzlePayments();
    }

    const search = searchTerm.trim().toLowerCase();
    
    // Build search conditions for payment fields and related student data
    const searchConditions = [
      ilike(Payment.id, `%${search}%`),
      ilike(Payment.transaction_id, `%${search}%`),
      // Note: amount is stored as integer (cents), so we need to handle number search
      ...(isNaN(Number(search)) ? [] : [eq(Payment.amount, Number(search) * 100)]), // Convert to cents
    ];

    const payments = await db.query.Payment.findMany({
      where: or(...searchConditions),
      ...paymentWithSort,
    });

    const parsedPayments = payments.map(parsePayment);
    
    // Additional filtering for student name search through transaction relations
    if (search) {
      return parsedPayments.filter(payment => {
        const studentName = payment.lambdas?.studentInfo?.name?.toLowerCase() || '';
        const studentEmail = payment.lambdas?.studentInfo?.email?.toLowerCase() || '';
        const amount = (payment.model.amount / 100).toString(); // Convert cents to euros for display
        const transactionId = payment.model.transaction_id?.toLowerCase() || '';
        const paymentId = payment.model.id.toLowerCase();
        
        return (
          studentName.includes(search) ||
          studentEmail.includes(search) ||
          amount.includes(search) ||
          transactionId.includes(search) ||
          paymentId.includes(search)
        );
      });
    }

    return parsedPayments;
  } catch (error) {
    console.error("Error searching payments with Drizzle:", error);
    throw new Error("Failed to search payments");
  }
}
