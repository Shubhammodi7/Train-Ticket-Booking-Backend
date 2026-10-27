import { z } from "zod";

const BERTHS = [
  "LOWER",
  "MIDDLE",
  "UPPER",
  "SIDE_LOWER",
  "SIDE_UPPER",
  "WINDOW",
  "NO_PREFERENCE",
] as const;

const ID_TYPES = [
  "AADHAAR",
  "PAN",
  "PASSPORT",
  "VOTER_ID",
  "DRIVING_LICENSE",
] as const;

const base = z.object({
  name: z.string().trim().min(2).max(100),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["M", "F", "OTHER"]),
  berthPreference: z.enum(BERTHS).nullable().optional(),
  nationality: z.string().trim().min(2).max(50).optional(),
  idProofType: z.enum(ID_TYPES).nullable().optional(),
  idProofNumber: z.string().trim().min(4).max(50).nullable().optional(),
});

export const createPassengerSchema = base.refine(
  (d) => !!d.idProofType === !!d.idProofNumber,
  {
    message: "idProofType and idProofNumber must be provided together",
    path: ["idProofNumber"],
  },
);

export const UpdatePassengerSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "Provide at least one field to update",
  });

export const passengerIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a number"),
});
