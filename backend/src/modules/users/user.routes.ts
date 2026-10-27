import { Router } from "express";
import { userController } from "./user.controller";

export const router = Router();

router.post("/register", userController.register);
router.get("/:id", userController.getUserById);
