import { ConflictError, NotFoundError } from "../../common/errors/http-error";
import { IStationLookup } from "../trains/train.types";
import {
  CreateStationInput,
  IStationRepository,
  Station,
  UpdateStationInput,
} from "./station.types";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export class StationService implements IStationLookup {
  constructor(private readonly repo: IStationRepository) {}

  async createStation(dto: CreateStationInput): Promise<Station> {
    try {
      return await this.repo.create(dto);
    } catch (err: any) {
      if (err.code === "23505") {
        throw new ConflictError(`Station with code ${dto.code} already exists`);
      }

      throw err;
    }
  }

  async getStation(codes: string[]): Promise<Station[] | null> {
    return this.repo.findByCode(codes);
  }

  async searchStations(
    q: string | undefined,
    limit: number,
  ): Promise<Station[]> {
    const prefix = q ? escapeLike(q) : undefined;
    return this.repo.search(prefix, limit);
  }

  async updateStation(code: string, dto: UpdateStationInput): Promise<Station> {
    const station = await this.repo.update(code, dto);
    if (!station)
      throw new NotFoundError(`Station with code ${code} not found`);

    return station;
  }

  async deactivateStation(code: string): Promise<void> {
    const flag = await this.repo.deactivate(code);

    if (!flag) throw new NotFoundError(`Station Not Found`);
  }

  async getStationsByCodes(codes: string[]): Promise<Station[]> {
    return (await this.repo.findByCode(codes)) ?? [];
  }
}
