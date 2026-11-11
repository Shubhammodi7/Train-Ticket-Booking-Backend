import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/http-error";
import {
  CreateTrainInput,
  IStationLookup,
  ITrainRepository,
  StopInput,
  TrainDetail,
  TrainSummary,
} from "./train.types";

export class TrainService {
  constructor(
    private readonly repo: ITrainRepository,
    private readonly stations: IStationLookup,
  ) {}

  async createTrain(dto: CreateTrainInput): Promise<TrainDetail> {
    this.validateRoute(dto.stops);

    const codes = dto.stops.map((s) => s.stationCode);
    if (new Set(codes).size !== codes.length) {
      throw new BadRequestError("A station cannot appear twice in one route");
    }

    const found = await this.stations.getStationsByCodes(codes);
    const idByCode = new Map(found.map((s) => [s.code, s.id]));
    const missing = codes.filter((c) => !idByCode.has(c));
    if (missing.length)
      throw new BadRequestError(`Unknown stations: ${missing.join(", ")}`);

    try {
      await this.repo.createWithStops({
        number: dto.number,
        name: dto.name,

        sourceStationId: idByCode.get(codes[0])!,
        destinationStationId: idByCode.get(codes[codes.length - 1])!,
        stops: dto.stops.map((s) => ({
          stationId: idByCode.get(s.stationCode)!,
          arrivalTime: s.arrivalTime ?? null,
          departureTime: s.departureTime ?? null,
          dayOffset: s.dayOffset ?? 0,
          distanceKm: s.distanceKm,
        })),
      });
    } catch (err: any) {
      if (err.code === "23505")
        throw new ConflictError(`Train ${dto.number} already exists`);
    }

    return this.getTrain(dto.number);
  }

  async getTrain(number: string): Promise<TrainDetail> {
    const train = await this.repo.findByNumber(number);
    if (!train) throw new NotFoundError("Train not found");
    return train;
  }

  listTrains(page: number, limit: number): Promise<TrainSummary[]> {
    return this.repo.list(limit, (page - 1) * limit);
  }

  async deactivateTrain(number: string): Promise<void> {
    if (!(await this.repo.deactivate(number)))
      throw new NotFoundError("Train not found");
  }

  private validateRoute(stops: StopInput[]): void {
    stops.forEach((s, i) => {
      const where = `stop ${i + 1} (${s.stationCode})`;
      const first = i === 0;
      const last = i === stops.length - 1;
      const prev = first ? null : stops[i - 1];
      const dayOffset = s.dayOffset ?? 0;
      const previousDayOffset = prev?.dayOffset ?? 0;

      if (first) {
        if (s.distanceKm !== 0)
          throw new BadRequestError(
            `${where}: the first stop must have distanceKm 0`,
          );
        if (s.arrivalTime)
          throw new BadRequestError(
            `${where}: the first stop has no arrival time`,
          );
        if (dayOffset !== 0)
          throw new BadRequestError(
            `${where}: the first stop must have dayOffset 0`,
          );
      } else {
        if (!s.arrivalTime)
          throw new BadRequestError(`${where}: arrivalTime is required`);
        if (s.distanceKm <= prev!.distanceKm) {
          throw new BadRequestError(
            `${where}: distanceKm must be greater than the previous stop`,
          );
        }
        if (dayOffset < previousDayOffset) {
          throw new BadRequestError(`${where}: dayOffset cannot go backwards`);
        }

        if (
          dayOffset === previousDayOffset &&
          s.arrivalTime < prev!.departureTime!
        ) {
          throw new BadRequestError(
            `${where}: arrives before the previous stop departs`,
          );
        }
      }

      if (!last && !s.departureTime)
        throw new BadRequestError(`${where}: departureTime is required`);
      if (last && s.departureTime)
        throw new BadRequestError(
          `${where}: the last stop has no departure time`,
        );
    });
  }
}
