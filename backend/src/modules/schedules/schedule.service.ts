import { NotFoundError } from "../../common/errors/http-error";
import {
  DayOfWeek,
  IScheduleRepository,
  ITrainLookup,
  ScheduleView,
  SetScheduleInput,
  TrainSchedule,
} from "./schedule.types";

const DAY_NAMES: Record<DayOfWeek, string> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
  7: "SUN",
};

export class ScheduleService {
  constructor(
    private readonly repo: IScheduleRepository,
    private readonly trains: ITrainLookup,
  ) {}

  async setSchedule(
    trainNumber: string,
    dto: SetScheduleInput,
  ): Promise<ScheduleView> {
    const train = await this.trains.getTrain(trainNumber);

    const days = [...new Set(dto.runningDays)].sort(
      (a, b) => a - b,
    ) as DayOfWeek[];

    const schedule = await this.repo.upsertSchedule(
      train.id,
      days,
      dto.isActive ?? true,
    );

    return this.toView(schedule, train.number);
  }

  async getSchedule(trainNumber: string): Promise<ScheduleView> {
    const train = await this.trains.getTrain(trainNumber);
    const schedule = await this.repo.findScheduleByTrain(train.id);

    if (!schedule) {
      throw new NotFoundError(`Schedule not found for train ${trainNumber}`);
    }

    return this.toView(schedule, train.number);
  }

  private toView(schedule: TrainSchedule, trainNumber: string): ScheduleView {
    return {
      ...schedule,
      trainNumber,
      runningDayNames: schedule.runningDays.map((d) => DAY_NAMES[d]),
    };
  }
}
