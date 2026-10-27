import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const { fieldErrors } = z.flattenError(err);
    return res.status(400).json({
      error: "Validation Failed",
      details: fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};
