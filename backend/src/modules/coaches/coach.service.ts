import { BadRequestError, ConflictError } from "../../common/errors/http-error";
import { IClassLookup } from "../classes/class.types";
import {
  BerthType,
  CoachInput,
  ICoachRepository,
  ITrainLookup,
  TrainCoaches,
  NewCoach,
  ClassSummary,
  CoachView,
  NewSeat,
} from "./coach.types";

const CHAIR_3_2: BerthType[] = ["WINDOW", "MIDDLE", "AISLE", "AISLE", "WINDOW"];
const CHAIR_2_2: BerthType[] = ["WINDOW", "AISLE", "AISLE", "WINDOW"];
const BERTH_8: BerthType[] = [
  "LOWER",
  "MIDDLE",
  "UPPER",
  "LOWER",
  "MIDDLE",
  "UPPER",
  "SIDE_LOWER",
  "SIDE_UPPER",
];
const BERTH_6: BerthType[] = [
  "LOWER",
  "UPPER",
  "LOWER",
  "UPPER",
  "SIDE_LOWER",
  "SIDE_UPPER",
];
const BERTH_2: BerthType[] = ["LOWER", "UPPER"];

const PATTERN_BY_CLASS: Record<string, BerthType[]> = {
  EC: CHAIR_2_2,
  "2A": BERTH_6,
  "1A": BERTH_2,
};
const DEFAULT_PATTERN = { CHAIR: CHAIR_3_2, BERTH: BERTH_8 } as const;

export class CoachService {
  constructor(
    private readonly repo: ICoachRepository,
    private readonly trains: ITrainLookup,
    private readonly classes: IClassLookup,
  ) {}

  // only admin access
  async setupCoaches(
    trainNumber: string,
    items: CoachInput[],
  ): Promise<TrainCoaches> {
    const train = await this.trains.getTrain(trainNumber);

    if ((await this.repo.countByTrain(train.id)) > 0) {
      throw new ConflictError(`Train ${trainNumber} already has coaches`);
    }

    const codes = items.map((i) => i.classCode.toUpperCase());
    const found = await this.classes.getClassByCodes(codes);
    const byCode = new Map(found.map((c) => [c.code, c]));

    const counters = new Map<string, number>();
    const newCoaches: NewCoach[] = items.map((item) => {
      const cls = byCode.get(item.classCode.toUpperCase())!;
      const n = (counters.get(cls.code) ?? 0) + 1;
      counters.set(cls.code, n);

      const totalSeats = item.totalSeats ?? cls.seatsPerCoach;
      const pattern =
        PATTERN_BY_CLASS[cls.code] ?? DEFAULT_PATTERN[cls.seatType];

      return {
        classId: cls.id,
        coachNo: `${cls.coachPrefix}${n}`,
        totalSeats,
        seatType: cls.seatType,
        seats: this.generateSeats(totalSeats, pattern),
      };
    });

    try {
      await this.repo.createWithSeats(train.id, newCoaches);
    } catch (err: any) {
      if (err.code === "23505")
        throw new ConflictError(`Train ${trainNumber} already has coaches`);
      throw err;
    }

    return this.getCoaches(trainNumber);
  }

  async getCoaches(trainNumber: string): Promise<TrainCoaches> {
    const train = await this.trains.getTrain(trainNumber);
    const coaches = await this.repo.listByTrain(train.id);
    return {
      trainNumber: train.number,
      coaches,
      summary: this.summarize(coaches),
    };
  }

  private summarize(coaches: CoachView[]): ClassSummary[] {
    const totals = new Map<string, ClassSummary>();

    for (const c of coaches) {
      const row = totals.get(c.classCode) ?? {
        classCode: c.classCode,
        coachCount: 0,
        totalSeats: 0,
      };
      row.coachCount += 1;
      row.totalSeats += Number(c.totalSeats);
      totals.set(c.classCode, row);
    }

    return [...totals.values()];
  }

  private generateSeats(total: number, pattern: BerthType[]): NewSeat[] {
    if (total < 1 || total > 150)
      throw new BadRequestError("Seat count must be between 1 and 150");
    return Array.from({ length: total }, (_, i) => ({
      seatNo: i + 1,
      berthType: pattern[i % pattern.length],
    }));
  }
}
