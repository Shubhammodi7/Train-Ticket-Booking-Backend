import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/errors/http-error";

import {
  PassengerRow,
  PassengerView,
  CreatePassengerInput,
  UpdatePassengerInput,
  BookingPassengerSnapshot,
  IPassengerRepository,
} from "./passenger.types";

const MAX_SAVED_PER_USER = 20;
const MAX_PER_BOOKING = 6;

const maskIdProof = (v: string | null) =>
  v ? "X".repeat(Math.max(v.length - 4, 0)) + v.slice(-4) : null;

const toView = (p: PassengerRow): PassengerView => ({
  ...p,
  idProofNumber: maskIdProof(p.idProofNumber),
});

export class PassengerService {
  constructor(private readonly repo: IPassengerRepository) {}

  async addPassenger(
    userId: string,
    dto: CreatePassengerInput,
  ): Promise<PassengerView> {
    const count = await this.repo.countActiveByUser(userId);

    if (count >= MAX_SAVED_PER_USER) {
      throw new BadRequestError(
        `You can save at most ${MAX_SAVED_PER_USER} passengers`,
      );
    }

    try {
      return toView(await this.repo.create(userId, dto));
    } catch (err: any) {
      if (err.code === "23505")
        throw new ConflictError(
          "A passenger with this ID proof already exists",
        );
      if (err.code === "23503") throw new UnauthorizedError("User not found");
      throw err;
    }
  }

  async listPassengers(userId: string): Promise<PassengerView[]> {
    return await (await this.repo.listActiveByUser(userId)).map(toView);
  }

  async getPassenger(userId: string, id: string): Promise<PassengerView> {
    const p = await this.repo.findByIdForUser(userId, id);

    if (!p) throw new NotFoundError("Passenger Not Found");

    return toView(p);
  }

  async updatePassenger(
    userId: string,
    id: string,
    dto: UpdatePassengerInput,
  ): Promise<PassengerView> {
    try {
      const p = await this.repo.update(userId, id, dto);

      if (!p) throw new NotFoundError("Passenger not found");

      return toView(p);
    } catch (err: any) {
      if (err.code === "23505")
        throw new ConflictError(
          "A passenger with this ID proof already exists",
        );
      throw err;
    }
  }

  async removePassenger(userId: string, id: string): Promise<void> {
    const ok = await this.repo.softDelete(userId, id);
    if (!ok) throw new NotFoundError("Passenger Not Found");
  }

  async getPassengerForBooking(
    userId: string,
    ids: string[],
  ): Promise<BookingPassengerSnapshot[]> {
    if (ids.length < 1 || ids.length > MAX_PER_BOOKING) {
      throw new BadRequestError(
        `A booking needs 1 to ${MAX_PER_BOOKING} passengers`,
      );
    }

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestError(`Duplicate passengers in the request`);
    }

    const rows = await this.repo.findActiveByIds(userId, ids);

    const byId = new Map(rows.map((r) => [r.id, r]));

    return ids.map((id) => {
      const p = byId.get(id);
      if (!p) throw new NotFoundError(`Passenger ${id} not found`);

      return {
        passengerId: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        berthPreference: p.berthPreference,
      };
    });
  }
}
