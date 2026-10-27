import { Request, Response } from "express";
import {
  createStationSchema,
  updateStationSchema,
  searchStationSchema,
  stationCodeParamSchema,
} from "./station.schema";
import { StationService } from "./station.service";

export class StationController {
  constructor(private readonly service: StationService) {}

  create = async (req: Request, res: Response) => {
    const dto = createStationSchema.parse(req.body);
    res.status(201).json({ data: await this.service.createStation(dto) });
  };

  search = async (req: Request, res: Response) => {
    const { q, limit } = searchStationSchema.parse(req.query);
    res.json({ data: await this.service.searchStations(q, limit) });
  };

  getByCode = async (req: Request, res: Response) => {
    const { code } = stationCodeParamSchema.parse(req.params);
    res.json({ data: await this.service.getStation(code) });
  };

  update = async (req: Request, res: Response) => {
    const { code } = stationCodeParamSchema.parse(req.params);
    const dto = updateStationSchema.parse(req.body);
    res.json({ data: await this.service.updateStation(code, dto) });
  };

  remove = async (req: Request, res: Response) => {
    const { code } = stationCodeParamSchema.parse(req.params);
    res.status(204).send();
  };
}
