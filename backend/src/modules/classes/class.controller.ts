import { Request, Response } from "express";
import { classCodeParamSchema, classCodeSchema } from "./class.schema";
import { ClassService } from "./class.service";

export class ClassController {
  constructor(private readonly service: ClassService) {}

  list = async (_req: Request, res: Response) => {
    res.json({ data: await this.service.listClasses() });
  };

  getByCode = async (req: Request, res: Response) => {
    const { code } = classCodeParamSchema.parse(req.params);
    res.json({ data: await this.service.getClass(code) });
  };
}
