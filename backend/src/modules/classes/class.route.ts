import { Router } from "express";
import { ClassController } from "./class.controller";
import { asyncHandler } from "../../common/utils/async-handler";

export function createClassRouter(c: ClassController): Router {
  const router = Router();

  router.get("/", asyncHandler(c.list));
  router.get("/:code", asyncHandler(c.getByCode));

  return router;
}
