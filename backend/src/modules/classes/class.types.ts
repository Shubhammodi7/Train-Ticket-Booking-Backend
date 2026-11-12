export type SeatType = "CHAIR" | "BERTH";

export interface TravelClass {
  id: string;
  code: string;
  name: string;
  coachPrefix: string;
  seatType: SeatType;
  seatsPerCoach: number;
  isActive: boolean;
  createdAt: Date;
}

export interface IClassRepository {
  listActive(): Promise<TravelClass[]>;
  findByCode(code: string): Promise<TravelClass | null>;
  findByCodes(code: string[]): Promise<TravelClass[]>;
}

export interface IClassLookup {
  getClassByCodes(code: string[]): Promise<TravelClass[]>;
}
