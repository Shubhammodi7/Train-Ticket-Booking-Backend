import { ClassRepository } from "./modules/classes/class.repository";
import { PassengerRepository } from "./modules/passengers/passenger.repository";
import { PassengerService } from "./modules/passengers/passenger.services";
import { PassengerController } from "./modules/passengers/passenger.controller";
import { StationRepository } from "./modules/stations/station.repository";
import { StationService } from "./modules/stations/station.service";
import { StationController } from "./modules/stations/station.controller";

import { TrainRepository } from "./modules/trains/train.repository";
import { TrainService } from "./modules/trains/train.service";
import { TrainController } from "./modules/trains/train.controller";
import { ClassService } from "./modules/classes/class.service";
import { ClassController } from "./modules/classes/class.controller";
import { CoachRepository } from "./modules/coaches/coach.repository";
import { CoachService } from "./modules/coaches/coach.service";
import { CoachController } from "./modules/coaches/coach.controller";

const passengerRepository = new PassengerRepository();
const passengerService = new PassengerService(passengerRepository);
const passengerController = new PassengerController(passengerService);

const stationRepository = new StationRepository();
const stationService = new StationService(stationRepository);
const stationController = new StationController(stationService);

const trainRepository = new TrainRepository();
const trainService = new TrainService(trainRepository, stationService);
const trainController = new TrainController(trainService);

const classRepository = new ClassRepository();
const classService = new ClassService(classRepository);
const classController = new ClassController(classService);

const coachRepository = new CoachRepository();
const coachService = new CoachService(
  coachRepository,
  trainService,
  classService,
);
const coachController = new CoachController(coachService);

export const container = {
  passengerService,
  passengerController,
  stationService,
  stationController,
  trainService,
  trainController,
  classService,
  classController,
  coachService,
  coachController,
};
