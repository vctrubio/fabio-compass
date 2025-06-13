import { z } from "zod";
import { EquipmentTypeEnum } from "./EnumModel";

// Equipment schema
export const Equipment = z.object({
  id: z.string().uuid(),
  serial_id: z.string(),
  type: EquipmentTypeEnum,
  model: z.string(),
  size: z.number(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// Form schema for creating equipment (omits id, created_at, updated_at)
export const EquipmentForm = Equipment.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Infer TypeScript type from Zod schema
export type EquipmentType = z.infer<typeof Equipment>;
export type EquipmentFormType = z.infer<typeof EquipmentForm>;

// KiteEventEquipment for the many-to-many relationship
export const KiteEventEquipment = z.object({
  kite_event_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
});

export type KiteEventEquipmentType = z.infer<typeof KiteEventEquipment>;