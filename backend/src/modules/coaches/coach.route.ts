import { Router } from "express";
import { CoachController } from "./coach.controller";
import { tempAuth } from "../../common/middlewares/temp-auth.middleware";
import { requireAdmin } from "../../common/middlewares/temp-admin.middleware";
import { asyncHandler } from "../../common/utils/async-handler";

export function createCoachRouter(c: CoachController): Router {
  const router = Router({ mergeParams: true });
  router.get("/", asyncHandler(c.list));
  router.post("/", tempAuth, requireAdmin, asyncHandler(c.setup));

  return router;
}
