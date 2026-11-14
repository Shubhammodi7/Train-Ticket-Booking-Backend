import { trainNumberParamSchema } from "./../trains/train.schema";
import { Request, Response } from "express";
import { CoachService } from "./coach.service";
import { setupCoachesSchema } from "./coach.schema";

export class CoachController {
  constructor(private readonly service: CoachService) {}

  setup = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);
    const { coaches } = setupCoachesSchema.parse(req.body);

    res
      .status(201)
      .json({ data: await this.service.setupCoaches(number, coaches) });
  };

  list = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);
    res.json({ data: await this.service.getCoaches(number) });
  };
}
