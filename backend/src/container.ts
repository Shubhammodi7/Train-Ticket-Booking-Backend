import { PassengerRepository } from "./modules/passengers/passenger.repository";
import { PassengerService } from "./modules/passengers/passenger.services";
import { PassengerController } from "./modules/passengers/passenger.controller";
import { StationRepository } from "./modules/stations/station.repository";
import { StationService } from "./modules/stations/station.service";
import { StationController } from "./modules/stations/station.controller";

const passengerRepository = new PassengerRepository();
const passengerService = new PassengerService(passengerRepository);
const passengerController = new PassengerController(passengerService);

const stationRepository = new StationRepository();
const stationService = new StationService(stationRepository);
const stationController = new StationController(stationService);

export const container = {
  passengerService,
  passengerController,
  stationService,
  stationController,
};
