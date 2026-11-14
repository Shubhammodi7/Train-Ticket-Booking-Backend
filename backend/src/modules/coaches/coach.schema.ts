import { z } from "zod";
import { classCodeSchema } from "../classes/class.schema";

const coachItemSchema = z.object({
  classCode: classCodeSchema,
  totalSeats: z.number().int().min(1).max(150).optional(),
});

export const setupCoachesSchema = z.object({
  coaches: z.array(coachItemSchema).min(1, "Add at least one coach").max(30),
});

export const trainNumberParamSchema = z.object({
  number: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "Train number must be 4 to 6 digits"),
});
