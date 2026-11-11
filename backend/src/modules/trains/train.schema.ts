import { z } from "zod";

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24 hour)");

const stopSchema = z.object({
  stationCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2,5}$/)
    .transform((v) => v.toUpperCase()),
  arrivalTime: time.nullable().optional(),
  departureTime: time.nullable().optional(),
  dayOffset: z.number().int().min(0).max(5).default(0),
  distanceKm: z.number().int().min(0).max(10000),
});

export const createTrainSchema = z.object({
  number: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "Train number must be 4 to 6 digits"),
  name: z.string().trim().min(2).max(100),
  stops: z.array(stopSchema).min(2, "A train needs at least 2 stops").max(60),
});

export const trainNumberParamSchema = z.object({
  number: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/),
});

export const listTrainsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
