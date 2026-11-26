import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { tempAuth } from "../../common/middlewares/temp-auth.middleware";
import { requireAdmin } from "../../common/middlewares/temp-admin.middleware";
import { asyncHandler } from "../../common/utils/async-handler";

export function createScheduleRouter(c: ScheduleController): Router {
  const router = Router({ mergeParams: true });

  router.get("/", asyncHandler(c.get));
  router.put("/", tempAuth, requireAdmin, asyncHandler(c.set));

  return router;
}
