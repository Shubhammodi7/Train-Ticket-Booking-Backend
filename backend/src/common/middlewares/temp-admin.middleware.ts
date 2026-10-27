import { UnauthorizedError } from "./../errors/http-error";
import { Request, Response, NextFunction } from "express";
import { query } from "../../infra/db";
import { AppError } from "../errors/app-error";

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const rows = await query<{ role: string }>(
      `SELECT role FROM users WHERE id = $1 AND status = 'ACTIVE'`,
      [req.userId],
    );

    if (rows[0]?.role !== "ADMIN")
      throw new AppError(403, "Admin access required");
    next();
  } catch (error) {
    next(error);
  }
}
