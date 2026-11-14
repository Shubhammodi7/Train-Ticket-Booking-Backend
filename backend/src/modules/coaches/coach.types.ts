import { SeatType } from "../classes/class.types";

export type ChairBerth = "WINDOW" | "MIDDLE" | "AISLE";
export type BerthBerth =
  | "LOWER"
  | "MIDDLE"
  | "UPPER"
  | "SIDE_LOWER"
  | "SIDE_UPPER";
export type BerthType = ChairBerth | BerthBerth;

export interface NewSeat {
  seatNo: number;
  berthType: BerthType;
}

export interface CoachInput {
  classCode: string;
  totalSeats?: number;
}

export interface SetupCoachesInput {
  coaches: CoachInput[];
}

export interface NewCoach {
  classId: string;
  coachNo: string;
  totalSeats: number;
  seatType: SeatType;
  seats: NewSeat[];
}

export interface CoachView {
  id: string;
  trainId: string;
  classId: string;
  classCode: string;
  coachNo: string;
  totalSeats: string;
}

export interface ClassSummary {
  classCode: string;
  coachCount: number;
  totalSeats: number;
}

export interface TrainCoaches {
  trainNumber: string;
  coaches: CoachView[];
  summary: ClassSummary[];
}

export interface ICoachRepository {
  createWithSeats(trainId: string, coaches: NewCoach[]): Promise<void>;
  listByTrain(trainId: string): Promise<CoachView[]>;
  countByTrain(trainId: string): Promise<number>;
}

export interface ITrainLookup {
  getTrain(number: string): Promise<{ id: string; number: string }>;
}
