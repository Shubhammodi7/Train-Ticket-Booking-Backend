import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);

export const createStationSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2,5}$/, "Code must be 2 to 5 letters")
    .transform((v) => v.toUpperCase()),
  name: text(100),
  city: text(100),
  state: text(100),
});

export const updateStationSchema = z
  .object({
    name: text(100).optional(),
    city: text(100).optional(),
    state: text(100).optional(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided for update",
  });

export const searchStationSchema = z.object({
  q: z.string().trim().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const stationCodeParamSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2,5}$/)
    .transform((v) => v.toUpperCase()),
});
