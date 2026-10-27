import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Mobile number format"),
  password: z.string().min(8).max(100),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a number"),
});
