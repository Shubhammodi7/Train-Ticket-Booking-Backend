import { PassengerRepository } from "./modules/passengers/passenger.repository";
import { PassengerService } from "./modules/passengers/passenger.services";
import { PassengerController } from "./modules/passengers/passenger.controller";
import { StationRepository } from "./modules/stations/station.repository";
import { StationService } from "./modules/stations/station.service";
import { StationController } from "./modules/stations/station.controller";

import { TrainRepository } from "./modules/trains/train.repository";
import { TrainService } from "./modules/trains/train.service";
import { TrainController } from "./modules/trains/train.controller";

const passengerRepository = new PassengerRepository();
const passengerService = new PassengerService(passengerRepository);
const passengerController = new PassengerController(passengerService);

const stationRepository = new StationRepository();
const stationService = new StationService(stationRepository);
const stationController = new StationController(stationService);

const trainRepository = new TrainRepository();
const trainService = new TrainService(trainRepository, stationService);
const trainController = new TrainController(trainService);

export const container = {
  passengerService,
  passengerController,
  stationService,
  stationController,
  trainService,
  trainController,
};
