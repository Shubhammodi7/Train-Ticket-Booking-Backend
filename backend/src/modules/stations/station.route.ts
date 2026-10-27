import { Router } from "express";
import { StationController } from "./station.controller";
import { tempAuth } from "../../common/middlewares/temp-auth.middleware";
import { requireAdmin } from "../../common/middlewares/temp-admin.middleware";
import { asyncHandler } from "../../common/utils/async-handler";

export function createStationRouter(c: StationController): Router {
  const router = Router();

  router.get("/", asyncHandler(c.search));
  router.get("/:code", asyncHandler(c.getByCode));

  router.post("/", tempAuth, requireAdmin, asyncHandler(c.create));
  router.patch("/:code", tempAuth, requireAdmin, asyncHandler(c.update));
  router.delete("/:code", tempAuth, requireAdmin, asyncHandler(c.remove));

  return router;
}
