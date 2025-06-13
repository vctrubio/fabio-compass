import db from "@/drizzle";
import { eq, desc } from "drizzle-orm";
import { Equipment } from "@/drizzle/migrations/schema";
import { EquipmentType } from "@/rails/model/EquipmentModel";
import { DrizzleData } from "@/rails/types";

const equipmentWithRelations = {
  with: {
    kiteEventEquipments: {
      with: {
        kiteEvent: true,
      },
    },
  },
} as const;

function parseEquipment(equipment: any): DrizzleData<EquipmentType> {
  const { kiteEventEquipments, ...equipmentModel } = equipment;

  // Count how many KiteEvents this equipment belongs to
  const kiteEventCount = kiteEventEquipments?.length || 0;

  // Extract KiteEvents with formatted date and duration
  const kiteEvents =
    kiteEventEquipments?.map((ke: any) => ({
      id: ke.kiteEvent.id,
      date: ke.kiteEvent.date,
      duration: ke.kiteEvent.duration, // Duration in minutes
      status: ke.kiteEvent.status,
    })) || [];

  return {
    model: equipmentModel,
    relations: {
      kiteEvents,
      kiteEventEquipments,
    },
    lambdas: {
      kiteEventCount,
    },
  };
}

const equipmentWithSort = {
  ...equipmentWithRelations,
  orderBy: desc(Equipment.created_at), // Sort by newest first
};

export async function drizzleEquipments(): Promise<
  DrizzleData<EquipmentType>[]
> {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Equipment");
    const equipments = await db.query.Equipment.findMany(equipmentWithSort);
    const result = equipments.map(parseEquipment);
    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Equipment");
    return result;
  } catch (error) {
    console.error("Error fetching equipment with Drizzle:", error);
    throw new Error("Failed to fetch equipment");
  }
}

export async function drizzleEquipmentById(
  id: string
): Promise<DrizzleData<EquipmentType> | null> {
  try {
    const equipment = await db.query.Equipment.findFirst({
      where: eq(Equipment.id, id),
      ...equipmentWithRelations, // Use the base relations without orderBy for single record
    });

    if (!equipment) {
      return null;
    }

    return parseEquipment(equipment);
  } catch (error) {
    console.error("Error fetching equipment by ID with Drizzle:", error);
    throw new Error("Failed to fetch equipment");
  }
}

export async function drizzleEquipmentBySerialId(
  serialId: string
): Promise<DrizzleData<EquipmentType> | null> {
  try {
    const equipment = await db.query.Equipment.findFirst({
      where: eq(Equipment.serial_id, serialId),
      ...equipmentWithRelations,
    });

    if (!equipment) {
      return null;
    }

    return parseEquipment(equipment);
  } catch (error) {
    console.error("Error fetching equipment by Serial ID with Drizzle:", error);
    throw new Error("Failed to fetch equipment");
  }
}
