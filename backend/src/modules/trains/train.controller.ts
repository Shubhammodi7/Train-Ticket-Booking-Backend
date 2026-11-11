import { Request, Response } from "express";
import { TrainService } from "./train.service";
import {
  createTrainSchema,
  listTrainsSchema,
  trainNumberParamSchema,
} from "./train.schema";

export class TrainController {
  constructor(private readonly service: TrainService) {}

  create = async (req: Request, res: Response) => {
    const dto = createTrainSchema.parse(req.body);
    res.status(201).json({
      data: await this.service.createTrain({
        ...dto,
        stops: dto.stops.map((stop) => ({
          ...stop,
          arrivalTime: stop.arrivalTime ?? undefined,
          departureTime: stop.departureTime ?? undefined,
        })),
      }),
    });
  };

  list = async (req: Request, res: Response) => {
    const { page, limit } = listTrainsSchema.parse(req.query);
    res.json({ data: await this.service.listTrains(page, limit) });
  };

  getByNumber = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);
    res.json({ data: await this.service.getTrain(number) });
  };

  remove = async (req: Request, res: Response) => {
    const { number } = trainNumberParamSchema.parse(req.params);
    await this.service.deactivateTrain(number);
    res.status(204).send();
  };
}
