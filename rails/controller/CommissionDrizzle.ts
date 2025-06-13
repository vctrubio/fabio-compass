import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Commission } from "@/drizzle/migrations/schema";
import { CommissionType } from "@/rails/model/CommissionModel";
import { DrizzleData } from "@/rails/types";

const commissionsWithRelations = {
  with: {
    transaction: {
      with: {
        teacher: true,
        student: true,
        kiteEvent: true,
        lesson: {
          with: {
            booking: true,
          },
        },
        booking: true,
        package: true,
      },
    },
  },
} as const;

function parseCommission(commission: any): DrizzleData<CommissionType> {
  const { transaction, ...commissionModel } = commission;

  return {
    model: commissionModel,
    relations: {
      transaction,
      teacher: transaction?.teacher || null,
      kiteEvent: transaction?.kiteEvent || null,
    },
    lambdas: calculateLambdaValues(commission),
  };
}

const commissionWithSort = {
  ...commissionsWithRelations,
  orderBy: desc(Commission.created_at), // Sort by newest first
};

function calculateLambdaValues(commission: any) {
  const transaction = commission.transaction;
  
  // Commission status based on both teacher and admin confirmation
  let commissionStatus = 'pending';
  if (commission.model?.teacher_confirmation && commission.model?.admin_confirmation) {
    commissionStatus = 'approved';
  } else if (commission.model?.teacher_confirmation && !commission.model?.admin_confirmation) {
    commissionStatus = 'teacher_confirmed';
  } else if (!commission.model?.teacher_confirmation && commission.model?.admin_confirmation) {
    commissionStatus = 'admin_confirmed';
  }
  
  // Calculate commission percentage based on transaction amount
  const commissionPercentage = transaction?.amount && commission.model?.amount
    ? Math.round((commission.model.amount / transaction.amount) * 100)
    : 0;
  
  // Calculate remaining amount for the school/platform
  const schoolAmount = transaction?.amount 
    ? transaction.amount - (commission.model?.amount || 0)
    : 0;
  
  // Get teacher details
  const teacherInfo = transaction?.teacher ? {
    id: transaction.teacher.id,
    name: transaction.teacher.name,
    email: transaction.teacher.email,
    role: commission.model?.commission_rate || 'freelance',
  } : null;
  
  // Get lesson details
  const lessonInfo = transaction?.lesson ? {
    id: transaction.lesson.id,
    date_start: transaction.lesson.date_start,
    date_end: transaction.lesson.date_end,
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

  // Check if commission is ready for payout
  const isReadyForPayout = commissionStatus === 'approved';

  return {
    commissionStatus, // 'pending', 'teacher_confirmed', 'admin_confirmed', 'approved'
    commissionPercentage, // Percentage of transaction amount
    schoolAmount, // Amount remaining for school after commission
    isReadyForPayout, // Boolean indicating if commission is ready for payout
    teacherInfo, // Clean teacher object with id, name, email, role
    studentInfo, // Clean student object with id, name, email
    lessonInfo, // Lesson details
    kiteEventInfo, // Kite event details
    bookingInfo, // Booking date range
  };
}

export async function drizzleCommissions(): Promise<DrizzleData<CommissionType>[]> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Commissions");
    const commissions = await db.query.Commission.findMany(commissionWithSort);
    const result = commissions.map(parseCommission);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Commissions");
    return result;
  } catch (error) {
    console.error("Error fetching commissions with Drizzle:", error);
    throw new Error("Failed to fetch commissions");
  }
}

export async function drizzleCommissionById(
  id: string
): Promise<DrizzleData<CommissionType> | null> {
  try {
    const commission = await db.query.Commission.findFirst({
      where: eq(Commission.id, id),
      ...commissionsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!commission) {
      return null;
    }

    return parseCommission(commission);
  } catch (error) {
    console.error("Error fetching commission by ID with Drizzle:", error);
    throw new Error("Failed to fetch commission");
  }
}
