import express from "express";

import { router as userRouter } from "./modules/users/user.routes";
import { errorHandler } from "./common/middlewares/error.middleware";
import { createPassengerRouter } from "./modules/passengers/passenger.route";
import { container } from "./container";
import { createStationRouter } from "./modules/stations/station.route";
import { createTrainRouter } from "./modules/trains/train.route";
import { createClassRouter } from "./modules/classes/class.route";
import { createCoachRouter } from "./modules/coaches/coach.route";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/users", userRouter);
app.use(
  "/api/passengers",
  createPassengerRouter(container.passengerController),
);
app.use("/api/stations", createStationRouter(container.stationController));
app.use("/api/trains", createTrainRouter(container.trainController));

app.use("/api/classes", createClassRouter(container.classController));

app.use(
  "/api/trains/:number/coaches",
  createCoachRouter(container.coachController),
);

app.use(errorHandler);
