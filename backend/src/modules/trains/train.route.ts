import { Router } from "express";
import { TrainController } from "./train.controller";
import { tempAuth } from "../../common/middlewares/temp-auth.middleware";
import { requireAdmin } from "../../common/middlewares/temp-admin.middleware";
import { asyncHandler } from "../../common/utils/async-handler";

export function createTrainRouter(c: TrainController): Router {
  const router = Router();

  // public
  router.get("/", asyncHandler(c.list));
  router.get("/:number", asyncHandler(c.getByNumber));

  // admin only
  router.post("/", tempAuth, requireAdmin, asyncHandler(c.create));
  router.delete("/:number", tempAuth, requireAdmin, asyncHandler(c.remove));
  return router;
}
