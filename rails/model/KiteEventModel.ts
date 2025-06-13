import { z } from "zod";
import { KiteEventStatusEnum, LocationEnum } from "./EnumModel";

// KiteEvent schema
export const KiteEvent = z.object({
  id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  date: z.string().datetime(),
  duration: z.number(),
  location: LocationEnum,
  status: KiteEventStatusEnum.default("planned"),
  trigger_transaction: z.boolean().default(false),
  created_at: z.string().optional().nullable(),
});

// Form schema for creating kite events (omits id and created_at)
export const KiteEventForm = KiteEvent.omit({
  id: true,
  created_at: true,
});

// Infer TypeScript type from Zod schema
export type KiteEventType = z.infer<typeof KiteEvent>;
export type KiteEventFormType = z.infer<typeof KiteEventForm>;
