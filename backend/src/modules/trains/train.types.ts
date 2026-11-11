import { Station } from "../stations/station.types";

export interface StopInput {
  stationCode: string;
  arrivalTime?: string;
  departureTime?: string;
  dayOffset?: number;
  distanceKm: number;
}

export interface CreateTrainInput {
  number: string;
  name: string;
  stops: StopInput[];
}

export interface NewTrain {
  number: string;
  name: string;
  sourceStationId: string;
  destinationStationId: string;
  stops: {
    stationId: string;
    arrivalTime: string | null;
    departureTime: string | null;
    dayOffset: number;
    distanceKm: number;
  }[];
}

export interface TrainSummary {
  id: string;
  number: string;
  name: string;
  isActive: boolean;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
}

export interface TrainStopView {
  seq: number;
  stationCode: string;
  stationName: string;
  arrivalTime: string | null;
  departureTime: string | null;
  dayOffset: number;
  distanceKm: number;
}

export interface TrainDetail extends TrainSummary {
  stops: TrainStopView[];
}

export interface ITrainRepository {
  createWithStops(input: NewTrain): Promise<void>;
  findByNumber(number: string): Promise<TrainDetail | null>;
  list(limit: number, offset: number): Promise<TrainSummary[]>;
  deactivate(number: string): Promise<boolean>;
}
export interface IStationLookup {
  getStationsByCodes(codes: string[]): Promise<Station[]>;
}
