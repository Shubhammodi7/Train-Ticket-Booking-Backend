import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/http-error";
import { TravelClass, IClassRepository, IClassLookup } from "./class.types";

export class ClassService implements IClassLookup {
  constructor(private readonly repo: IClassRepository) {}

  listClasses(): Promise<TravelClass[]> {
    return this.repo.listActive();
  }

  async getClass(code: string): Promise<TravelClass> {
    const found = await this.repo.findByCode(code.toUpperCase());
    if (!found) throw new NotFoundError("Class Not Found");
    return found;
  }

  async getClassByCodes(codes: string[]): Promise<TravelClass[]> {
    const unique = [...new Set(codes.map((c) => c.toUpperCase()))];
    const found = await this.repo.findByCodes(unique);

    const foundCodes = new Set(found.map((c) => c.code));
    const missing = unique.filter((c) => !foundCodes.has(c));
    if (missing.length) {
      throw new BadRequestError(`Unknown classes: ${missing.join(", ")}`);
    }

    return found;
  }
}
