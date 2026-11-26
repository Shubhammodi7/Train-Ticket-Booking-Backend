export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

//input from controller
export interface SetScheduleInput {
  runningDays: DayOfWeek[];
  isActive?: boolean;
}

// what the repo will return
export interface TrainSchedule {
  id: string;
  trainId: string;
  runningDays: DayOfWeek[];
  isActive: boolean;
}

// what will be shown in final API response
export interface ScheduleView extends TrainSchedule {
  trainNumber: string;
  runningDayNames: string[];
}

export interface IScheduleRepository {
  upsertSchedule(
    trainId: string,
    runningDays: DayOfWeek[],
    isActive: boolean,
  ): Promise<TrainSchedule>;

  findScheduleByTrain(trainId: string): Promise<TrainSchedule | null>;
}

export interface ITrainLookup {
  getTrain(number: string): Promise<{ id: string; number: string }>;
}
