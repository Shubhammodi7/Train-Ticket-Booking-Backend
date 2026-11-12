import { z } from "zod";

export const classCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{2,4}$/, "Class code must be 2 to 4 letters or digits")
  .transform((v) => v.toUpperCase());

export const classCodeParamSchema = z.object({
  code: classCodeSchema,
});
