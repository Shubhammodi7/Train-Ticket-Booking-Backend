import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";
import { setScheduleSchema } from "./schedule.schema";
import { trainNumberParamSchema } from "../trains/train.schema";

export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  set = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);

    const dto = setScheduleSchema.parse(req.body);

    res.json({ data: await this.service.setSchedule(number, dto) });
  };

  get = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);

    res.json({ data: await this.service.getSchedule(number) });
  };
}
