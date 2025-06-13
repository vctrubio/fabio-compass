import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { KiteEvent } from "@/drizzle/migrations/schema";
import { KiteEventType } from "@/rails/model/KiteEventModel";
import { DrizzleData } from "@/rails/types";

const kiteEventsWithRelations = {
  with: {
    lesson: {
      with: {
        teacher: {
          with: {
            userWallet: true,
          },
        },
        booking: {
          with: {
            package: true,
            bookingStudents: {
              with: {
                student: true,
              },
            },
          },
        },
      },
    },
    transactions: true,
    kiteEventEquipments: {
      with: {
        equipment: true,
      },
    },
  },
} as const;

function parseKiteEvent(kiteEvent: any): DrizzleData<KiteEventType> {
  const { lesson, transactions, kiteEventEquipments, ...kiteEventModel } = kiteEvent;

  // Extract equipment from kiteEventEquipments
  const equipmentItems = kiteEventEquipments?.map((ke: any) => ke.equipment) || [];

  return {
    model: kiteEventModel,
    relations: {
      booking: lesson?.booking || null,
      lesson,
      transactions,
      equipmentItems,
      kiteEventEquipments,
    },
    lambdas: calculateLambdaValues(kiteEvent),
  };
}

const kiteEventWithSort = {
  ...kiteEventsWithRelations,
  orderBy: desc(KiteEvent.created_at), // Sort by newest first
};

function calculateLambdaValues(kiteEvent: any) {
  // Extract students from lesson -> booking -> bookingStudents
  const students = kiteEvent.lesson?.booking?.bookingStudents?.map((bs: any) => bs.student) || [];
  const studentNames = students.map((student: any) => student?.name).filter(Boolean);
  
  // Extract equipment from kiteEventEquipments
  const equipments = kiteEvent.kiteEventEquipments?.map((ke: any) => ke.equipment) || [];
  const equipmentTypes = equipments.map((eq: any) => eq?.type).filter(Boolean);
  
  return {
    studentsCount: students.length,
    equipmentCount: equipments.length,
    studentNames,
    equipmentTypes,
  };
}

export async function drizzleKiteEvents(): Promise<
  DrizzleData<KiteEventType>[]
> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: KiteEvents");
    const kiteEvents = await db.query.KiteEvent.findMany(kiteEventWithSort);
    const result = kiteEvents.map(parseKiteEvent);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: KiteEvents");
    return result;
  } catch (error) {
    console.error("Error fetching kite events with Drizzle:", error);
    throw new Error("Failed to fetch kite events");
  }
}

export async function drizzleKiteEventById(
  id: string
): Promise<DrizzleData<KiteEventType> | null> {
  try {
    const kiteEvent = await db.query.KiteEvent.findFirst({
      where: eq(KiteEvent.id, id),
      ...kiteEventsWithRelations, // Use the base relations without orderBy for single record
    });

    if (!kiteEvent) {
      return null;
    }

    return parseKiteEvent(kiteEvent);
  } catch (error) {
    console.error("Error fetching kite event by ID with Drizzle:", error);
    throw new Error("Failed to fetch kite event");
  }
}
