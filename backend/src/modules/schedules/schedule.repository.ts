import { query } from "../../infra/db";
import {
  DayOfWeek,
  IScheduleRepository,
  TrainSchedule,
} from "./schedule.types";

const COLUMNS = `
  id, train_id as "trainId", running_days as "runningDays", is_active as "isActive"
`;

export class ScheduleRepository implements IScheduleRepository {
  async upsertSchedule(
    trainId: string,
    runningDays: DayOfWeek[],
    isActive: boolean,
  ): Promise<TrainSchedule> {
    const rows = await query(
      `insert into train_schedules (train_id, running_days, is_active)
      values ($1, $2::smallint[], $3)
      on conflict (train_id) do update
        set running_days = excluded.running_days,
        is_active = excluded.is_active
      returning ${COLUMNS}`,
      [trainId, runningDays, isActive],
    );

    return rows[0] as TrainSchedule;
  }

  async findScheduleByTrain(trainId: string): Promise<TrainSchedule | null> {
    const rows = await query(
      `select ${COLUMNS} from train_schedules where train_id = $1`,
      [trainId],
    );
    return rows[0] as TrainSchedule | null;
  }
}
