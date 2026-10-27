export type Gender = "M" | "F" | "OTHER";

export interface PassengerRow {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  berthPreference: string | null;
  nationality: string;
  idProofType: string | null;
  idProofNumber: string | null;
  isActive: boolean;
  createdAt: Date;
}

export type PassengerView = Omit<PassengerRow, "idProofNumber"> & {
  idProofNumber: string | null;
};

export interface CreatePassengerInput {
  name: string;
  age: number;
  gender: Gender;
  berthPreference?: string | null;
  nationality?: string;
  idProofType?: string | null;
  idProofNumber?: string | null;
}

export type UpdatePassengerInput = Partial<CreatePassengerInput>;

export interface BookingPassengerSnapshot {
  passengerId: string;
  name: string;
  age: number;
  gender: Gender;
  berthPreference: string | null;
}

export interface IPassengerRepository {
  create(userId: string, input: CreatePassengerInput): Promise<PassengerRow>;

  countActiveByUser(userId: string): Promise<number>;

  listActiveByUser(userId: string): Promise<PassengerRow[]>;

  findByIdForUser(userId: string, id: string): Promise<PassengerRow | null>;

  update(
    userId: string,
    id: string,
    patch: UpdatePassengerInput,
  ): Promise<PassengerRow | null>;

  softDelete(userId: string, id: string): Promise<boolean>;

  findActiveByIds(userId: string, ids: string[]): Promise<PassengerRow[]>;
}
