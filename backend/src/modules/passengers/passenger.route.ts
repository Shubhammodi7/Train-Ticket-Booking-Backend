import { Router } from "express";
import { PassengerController } from "./passenger.controller";
import { tempAuth } from "../../common/middlewares/temp-auth.middleware";
import { asyncHandler } from "../../common/utils/async-handler";

export function createPassengerRouter(c: PassengerController): Router {
  const router = Router();
  router.use(tempAuth);

  router.post("/", asyncHandler(c.create));
  router.get("/", asyncHandler(c.list));
  router.get("/:id", asyncHandler(c.getOne));
  router.patch("/:id", asyncHandler(c.update));
  router.delete("/:id", asyncHandler(c.remove));

  return router;
}
