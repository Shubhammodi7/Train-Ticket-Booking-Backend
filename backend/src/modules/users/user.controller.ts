import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { createUserSchema, userIdParamSchema } from "./user.schema";

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createUserSchema.parse(req.body);
      const user = await userService.register(dto);

      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = userIdParamSchema.parse(req.params);

      const user = await userService.getUserById(id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  },
};
