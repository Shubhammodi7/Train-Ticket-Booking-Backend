import bcrypt from "bcryptjs";
import { AppError } from "../../common/errors/app-error";
import { userRepository } from "./user.repository";
import { CreateUserDto } from "./user.schema";
import { User } from "./user.types";

export const userService = {
  async register(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await userRepository.create({
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        passwordHash,
      });
    } catch (error) {
      console.error(error);
      throw new AppError(500, "Failed to create user");
    }
  },

  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  },
};
