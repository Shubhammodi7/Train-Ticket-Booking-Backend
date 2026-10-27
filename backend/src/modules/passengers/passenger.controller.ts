import { userService } from "./../users/user.service";
import { Request, Response } from "express";
import { PassengerService } from "./passenger.services";
import {
  createPassengerSchema,
  passengerIdParamSchema,
  UpdatePassengerSchema,
} from "./passenger.schema";

export class PassengerController {
  constructor(private readonly service: PassengerService) {}

  create = async (req: Request, res: Response) => {
    const dto = createPassengerSchema.parse(req.body);
    const data = await this.service.addPassenger(req.userId!, dto);

    res.status(201).json({ data });
  };

  list = async (req: Request, res: Response) => {
    res.json({ data: await this.service.listPassengers(req.userId!) });
  };

  getOne = async (req: Request, res: Response) => {
    const { id } = passengerIdParamSchema.parse(req.params);
    res.json({ data: await this.service.getPassenger(req.userId!, id) });
  };

  update = async (req: Request, res: Response) => {
    const { id } = passengerIdParamSchema.parse(req.params);
    const dto = UpdatePassengerSchema.parse(req.body);
    res.json({
      data: await this.service.updatePassenger(req.userId!, id, dto),
    });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = passengerIdParamSchema.parse(req.params);
    await this.service.removePassenger(req.userId!, id);
    res.status(204).send();
  };
}
