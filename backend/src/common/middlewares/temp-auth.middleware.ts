import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/http-error";

export function tempAuth(req: Request, _res: Response, next: NextFunction) {
  const id = req.header("x-user-id");
  console.log("tempAuth header:", id);

  if (!id || !/^\d+$/.test(id)) {
    return next(new UnauthorizedError("Missing or invalid x-user-id header"));
  }
  req.userId = id;
  next();
}
