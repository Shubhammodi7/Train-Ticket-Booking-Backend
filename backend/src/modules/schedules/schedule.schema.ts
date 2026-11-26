import { z } from "zod";
import { DayOfWeek } from "./schedule.types";

export const setScheduleSchema = z.object({
  runningDays: z
    .array(z.number().int().min(1).max(7))
    .min(1, "Pick at least one day")
    .max(7)
    .transform(
      (days) => [...new Set(days)].sort((a, b) => a - b) as DayOfWeek[],
    ),

  isActive: z.boolean().optional().default(true),
});
