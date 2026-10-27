import { ConflictError, NotFoundError } from "../../common/errors/http-error";
import {
  CreateStationInput,
  IStationRepository,
  Station,
  UpdateStationInput,
} from "./station.types";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export class StationService {
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

  async getStation(code: string): Promise<Station> {
    const station = await this.repo.findByCode(code);
    if (!station)
      throw new NotFoundError(`Station with code ${code} not found`);

    return station;
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
}
